import _ from 'lodash';
import UserAgentParser from 'ua-parser-js';
import languageMessages from './outdatedMessages.json';

const COLORS = {
  salmon: '#f25648',
  white: 'white',
};

function main(options = {}) {
  const parsedUserAgent = new UserAgentParser(navigator.userAgent).getResult();

  // Variable definition (before ajax)
  const outdatedUI = document.getElementById('outdated');

  const browserLocale = window.navigator.language || window.navigator.userLanguage; // Everyone else, IE
  // CSS property to check for. You may also like 'borderSpacing', 'boxShadow', 'transform', 'borderImage';
  const backgroundColor = options.backgroundColor || COLORS.salmon;
  const textColor = options.textColor || COLORS.white;
  const fullscreen = options.fullscreen || false;
  const language = options.language || browserLocale.slice(0, 2); // Language code

  let updateSource = 'web'; // Other possible values are 'googlePlay' or 'appStore'. Determines where we tell users to go for upgrades.

  // Chrome mobile is still Chrome (unlike Safari which is 'Mobile Safari')
  const isAndroid = parsedUserAgent.os.name === 'Android';
  if (isAndroid) {
    updateSource = 'googlePlay';
  } else if (parsedUserAgent.os.name === 'iOS') {
    updateSource = 'appStore';
  }

  let done = true;

  const changeOpacity = opacityValue => {
    outdatedUI.style.opacity = String(opacityValue / 100);
    outdatedUI.style.filter = `alpha(opacity=${opacityValue})`;
  };

  const fadeIn = opacityValue => {
    changeOpacity(opacityValue);
    if (opacityValue === 1) {
      outdatedUI.style.display = 'table';
    }
    if (opacityValue === 100) {
      done = true;
    }
  };

  const makeFadeInFunction = opacityValue => () => {
    fadeIn(opacityValue);
  };

  // Style element explicitly - TODO: investigate and delete if not needed
  const startStylesAndEvents = () => {
    const buttonClose = document.getElementById('buttonCloseUpdateBrowser');
    const buttonUpdate = document.getElementById('buttonUpdateBrowser');

    // check settings attributes
    outdatedUI.style.backgroundColor = backgroundColor;
    // way too hard to put !important on IE6
    outdatedUI.style.color = textColor;
    outdatedUI.children[0].children[0].style.color = textColor;
    outdatedUI.children[0].children[1].style.color = textColor;

    // Update button is desktop only
    if (buttonUpdate) {
      buttonUpdate.style.color = textColor;
      if (buttonUpdate.style.borderColor) {
        buttonUpdate.style.borderColor = textColor;
      }

      // Override the update button color to match the background color
      buttonUpdate.onmouseover = function onmouseover() {
        this.style.color = backgroundColor;
        this.style.backgroundColor = textColor;
      };

      buttonUpdate.onmouseout = function onmouseout() {
        this.style.color = textColor;
        this.style.backgroundColor = backgroundColor;
      };
    }

    buttonClose.style.color = textColor;

    buttonClose.onmousedown = () => {
      outdatedUI.style.display = 'none';
      return false;
    };
  };

  const getMessage = lang => {
    const defaultMessages = languageMessages[lang] || languageMessages.en;
    const customMessages = options.messages && options.messages[lang];
    const messages = _.merge({}, defaultMessages, customMessages);

    const updateMessages = {
      web: `<p>${messages.update.web}${
        messages.url
          ? `<a id="buttonUpdateBrowser" rel="nofollow" href="${messages.url}">${messages.callToAction}</a>`
          : ''
      }</p>`,
      googlePlay: `<p>${messages.update.googlePlay}<a id="buttonUpdateBrowser" rel="nofollow" href="https://play.google.com/store/apps/details?id=com.android.chrome">${messages.callToAction}</a></p>`,
      appStore: `<p>${messages.update[updateSource]}</p>`,
    };

    const updateMessage = updateMessages[updateSource];

    return `<div class="vertical-center"><h6>${messages.outOfDate}</h6>${updateMessage}<p class="last"><a href="#" id="buttonCloseUpdateBrowser" title="${messages.close}">&times;</a></p></div>`;
  };

  // This is an outdated browser and the banner needs to show

  if (done && outdatedUI.style.opacity !== '1') {
    done = false;

    for (let opacity = 1; opacity <= 100; opacity++) {
      setTimeout(makeFadeInFunction(opacity), opacity * 8);
    }
  }

  const insertContentHere = document.getElementById('outdated');
  if (fullscreen) {
    insertContentHere.classList.add('fullscreen');
  }
  insertContentHere.innerHTML = getMessage(language);
  startStylesAndEvents();
}

const options = typeof window !== 'undefined' && window.oaOutdatedOptions;

if (options) {
  // Load main when DOM ready.
  if (typeof window.onload !== 'function') {
    window.onload = () => main(options);
  } else {
    const oldOnload = window.onload;

    window.onload = function onload() {
      if (oldOnload) {
        oldOnload(undefined);
      }
      main(options);
    };
  }
}
