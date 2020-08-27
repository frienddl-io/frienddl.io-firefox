<p align="center">
  <img id="logo" src="img/logo.png" class="center" alt="frienddl.io" title="frienddl.io" />
</p>

[![](https://img.shields.io/amo/v/frienddlio?color=6778C6)](https://github.com/frienddl-io/frienddl.io-firefox/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/frienddl-io/frienddl.io-firefox/blob/main/LICENSE.md)

frienddl.io is a browser extension to find friends on [skribbl.io](https://skribbl.io/), a free online multiplayer drawing & guessing game.

Download it now on [Chrome](https://chrome.google.com/webstore/detail/frienddlio/bmadghlcpopfbnfcpmicdoafognfbhmm) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/frienddlio/)!

This is the codebase for the Mozilla Firefox version, but the goal is for all versions to have nearly identical code and feature parity.

## Features

- Works in the background so you can focus on other things while waiting
- Alerts you when a friend has been found
- Saves your friends so you don't have to type them in repeatedly
- Pause to add more friends and continue searching
- Stop to close out the search window
- Option to open the search window minimized
- Keeps track of search stats
- Updates badge to show how many games have been joined
- Handles disconnect errors cleanly to keep the search running

## Support

More information [here](https://github.com/frienddl-io/frienddl.io-support)

## Contributions

This project is open for anyone to contribute. Follow these steps:

1. Fork this repository
2. Follow the [Getting Started](#getting-started) steps to get the code running locally
3. Make changes
4. Reload the extension
5. Test changes by running the application locally
6. Linter
   1. Install npm if you haven't already: https://www.npmjs.com/get-npm
   2. Run `npm install`
   3. Run the linter: `eslint js\`
7. When satisfied with changes and lint is clean, open a pull request with screenshots of your testing evidence

## Getting Started

1. Clone repository:

    ```sh
    git clone https://github.com/frienddl-io/frienddl.io-firefox.git
    ```

2. Open the debugging page in Firefox: `about:debugging`
3. Go to the "This Firefox" tab
4. Select "Load Temporary Add-on..."
5. Open the `frienddl.io-firefox` directory and select the `manifest.json` file

## Credits

- GIFs and background image: [skribbl.io](https://skribbl.io/)
- Font in logo: [Kimberly Geswein](http://www.kimberlygeswein.com/)
- Favicon generation: [Favic-o-Matic](https://favicomatic.com/)
- JS library: [jQuery](https://jquery.com/)
- CSS framework: [Bootstrap](https://getbootstrap.com/)
