console.log('frienddl.io background script loaded');

const SKRIBBLIO_URL = 'https://skribbl.io/';

// Text for badge
const SUCCESS_BADGE_TEXT = '!';

// Colors for badge
const STOP_BADGE_COLOR = '#dc3545';
const SUCCESS_BADGE_COLOR = '#17A2B8';

const CONTENT_PORTS = [];

// Updates a tab to go to the skribbl.io home page
function goToSkribblioHomePageAsync(tabId) {
  return new Promise(
    (resolve) => {
      browser.tabs.update(
        tabId,
        {
          url: SKRIBBLIO_URL,
          active: false,
        },
        async (tab) => {
          browser.tabs.onUpdated.addListener(
            function listener(listenerTabId, info) {
              if (info.status === 'complete' && listenerTabId === tab.id) {
                browser.tabs.onUpdated.removeListener(listener);
                resolve(tab);
              } else {
                console.log(`Not ready | info.status: ${info.status} , Target Tab: ${listenerTabId} , Current Tab: ${tab.id}`);
              }
            },
          );
        },
      );
    },
  );
}

// Updates the values in storage related to players found or seen
function updatePlayersFound(playersArray) {
  browser.storage.local.get(
    [
      'playersFound',
      'totalPlayersSeen',
    ],
    (response) => {
      const playersFound = [response.playersFound];
      if (playersFound !== undefined) {
        console.dir(playersFound);
      }
      const newPlayersFound = [];
      playersArray.forEach(
        (element) => {
          if (playersFound.indexOf(element) === -1) {
            newPlayersFound.push(element);
          }
        },
      );

      const totalPlayersFound = newPlayersFound.concat(playersFound);

      let newTotalPlayersSeen = playersArray.length;
      if (typeof response.totalPlayersSeen !== 'undefined') {
        newTotalPlayersSeen += response.totalPlayersSeen;
      }

      browser.storage.local.set(
        {
          playersFound: totalPlayersFound,
          totalPlayersSeen: newTotalPlayersSeen,
        },
      );
    },
  );
}

// Updates values in storage
function updateStorage() {
  browser.storage.local.get(
    [
      'gamesJoined',
      'startTime',
      'runTime',
      'totalGamesJoined',
    ],
    (response) => {
      console.dir(response);
      const newGamesJoined = response.gamesJoined + 1;
      browser.browserAction.setBadgeText(
        {
          text: newGamesJoined.toString(),
        },
      );

      const startTime = [response.startTime];
      const newRunTime = new Date().getTime() - startTime;

      let newTotalGamesJoined = 1;
      if (response.totalGamesJoined !== undefined) {
        newTotalGamesJoined += response.totalGamesJoined;
      }

      browser.storage.local.set(
        {
          gamesJoined: newGamesJoined,
          totalGamesJoined: newTotalGamesJoined,
          runTime: newRunTime,
        },
      );
    },
  );
}

// Returns the current run time
function getCurrentRunTime(startTime, currentTime = undefined) {
  if (currentTime === undefined) {
    return new Date().getTime() - startTime;
  }
  return currentTime - startTime;
}

// Updates badge to reflect the state
function updateBadge(state) {
  console.log(`Making badge updates for: ${state}`);
  switch (state) {
    case 'stop':
      browser.browserAction.setBadgeBackgroundColor(
        {
          color: STOP_BADGE_COLOR,
        },
      );
      break;
    case 'success':
      browser.browserAction.setBadgeText(
        {
          text: SUCCESS_BADGE_TEXT,
        },
      );
      browser.browserAction.setBadgeBackgroundColor(
        {
          color: SUCCESS_BADGE_COLOR,
        },
      );
      break;
    default:
      console.error(`State to update invalid: ${state}`);
  }
}

// Steps to take when one or more friends are found
function foundFriend(friendsArray) {
  console.log('Found friend');
  browser.storage.local.set(
    {
      state: 'stop',
    },
    () => {
      updateBadge('success');

      browser.storage.local.get(
        [
          'startTime',
          'runTime',
          'totalFriendsFound',
          'totalRunTime',
          'windowId',
        ],
        (response) => {
          const currentTime = new Date().getTime();
          const finalRunTime = getCurrentRunTime(response.startTime, currentTime);

          let newTotalFriendsFound = 1;
          if (response.totalFriendsFound !== undefined) {
            newTotalFriendsFound += response.totalFriendsFound;
          }

          let newTotalRunTime = finalRunTime;
          if (response.totalRunTime !== undefined) {
            newTotalRunTime += response.totalRunTime;
          }

          browser.storage.local.set(
            {
              friendsFound: friendsArray,
              runTime: finalRunTime,
              endTime: currentTime,
              totalFriendsFound: newTotalFriendsFound,
              totalRunTime: newTotalRunTime,
            },
          );

          browser.windows.update(
            response.windowId,
            {
              drawAttention: true,
            },
          );

          const language = browser.i18n.getUILanguage().split('-')[0];
          console.log(`Using language: ${language}`);
          const audio = new Audio(`../_locales/${language}/success.mp3`);
          audio.play();
        },
      );
    },
  );
}

// Steps to take when a new game needs to be joined
function joinNewGame(newGameTabId) {
  (
    async () => {
      console.log('Awaiting skribbl.io home page load');
      await goToSkribblioHomePageAsync(newGameTabId);

      console.log('Waiting for content script to load');
      const checkIfContentScriptIsLoaded = setInterval(
        () => {
          if (CONTENT_PORTS.includes(newGameTabId)) {
            console.log('Loaded');

            browser.storage.local.get(
              [
                'state',
              ],
              (response) => {
                if (response.state === 'search') {
                  console.log('Sending message to join new game');
                  browser.tabs.sendMessage(
                    newGameTabId,
                    {
                      tabId: newGameTabId,
                      task: 'retrieveContent',
                    },
                    // eslint-disable-next-line no-use-before-define
                    respondToContent,
                  );
                } else {
                  console.log(`State is not search: ${response.state}`);
                }
              },
            );
            clearInterval(checkIfContentScriptIsLoaded);
          } else {
            console.log('Content script isn\'t loaded');
            console.dir(CONTENT_PORTS);
            console.log(CONTENT_PORTS.includes(newGameTabId));
          }
        },
        100,
      );
    }
  )();
}

// Processes the response from the content of a game
function respondToContent(response) {
  console.log('Received response from content');
  console.dir(response);
  updateStorage();

  if (response === undefined) {
    const lastError = browser.runtime.lastError.message;
    console.log(`Response was undefined, last error: ${lastError}`);
  } else {
    console.log('Searching players for friends');

    const playersArray = [response.players];

    if (playersArray.length > 1) {
      updatePlayersFound(playersArray, response.tabId);

      browser.storage.local.get(
        [
          'friends',
          'state',
        ],
        (getResponse) => {
          const friendsFound = [];
          getResponse.friends.forEach(
            (friend) => {
              if (playersArray.includes(friend)) {
                friendsFound.push(friend);
              }
            },
          );

          if (friendsFound.length === 0) {
            console.log('No friends found');
            if (getResponse.state === 'search') {
              joinNewGame(response.tabId);
            }
          } else {
            foundFriend(friendsFound, response.tabId);
          }
        },
      );
    } else {
      console.log('Only 1 players was found');
      joinNewGame(response.tabId);
    }
  }
}

// Listen for messages from popup
browser.runtime.onConnect.addListener(
  (port) => {
    if (port.name === 'p2b') {
      console.log('Connected to p2b');
      port.onMessage.addListener(
        (message) => {
          console.dir(message);

          if (message.task === 'joinNewGame') {
            joinNewGame(message.tabId);
          }
        },
      );
    } if (port.name === 'c2b') {
      const tabId = port.sender.tab.id;
      CONTENT_PORTS.push(tabId);
    } else {
      console.log(`Port is not recognized: ${port.name}`);
    }
  },
);

function stopSearch() {
  updateBadge('stop');
  browser.storage.local.get(
    [
      'startTime',
      'state',
    ],
    (response) => {
      if (response.state !== 'stop') {
        const storageUpdate = {
          state: 'stop',
        };

        if (response.state !== 'pause') {
          console.log('Updating endTime and runTime');

          const currentTime = new Date().getTime();
          storageUpdate.endTime = currentTime;
          storageUpdate.runTime = getCurrentRunTime(response.startTime, currentTime);
        } else {
          console.log('Not updating endTime and runTime due to previous pause state');
        }
        browser.storage.local.set(storageUpdate);
      }
    },
  );
}

// Listen for window to close
browser.windows.onRemoved.addListener(
  (windowId) => {
    browser.storage.local.get(
      [
        'windowId',
      ],
      (response) => {
        if (windowId === response.windowId) {
          stopSearch();
        }
      },
    );
  },
);
