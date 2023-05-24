import UserAgentParser from 'ua-parser-js';
import locales from './locales';

function getOutdatedElem() {
  const outdatedUI = document.getElementById('outdated');
  if (outdatedUI) return outdatedUI;

  const div = document.createElement('div');
  div.id = 'outdated'
  document.body.insertAdjacentElement('afterbegin', div);

  return div;
}

function getUpdateMessage(messages) {
  const parsedUserAgent = new UserAgentParser(navigator.userAgent).getResult();

  if (parsedUserAgent.os.name === 'Android' && parsedUserAgent.browser.name === 'Chrome') {
    return `<p>${messages.updateGooglePlay}<a id="buttonUpdateBrowser" rel="nofollow" href="https://play.google.com/store/apps/details?id=com.android.chrome">${messages.callToAction}</a></p>`
  }

  if (parsedUserAgent.os.name === 'iOS' && parsedUserAgent.browser.name === 'Safari') {
    return `<p>${messages.updateAppStore}</p>`;
  }

  return `<p>${messages.updateWeb}${
    messages.url
      ? ` <a id="buttonUpdateBrowser" rel="nofollow" href="${messages.url}">${messages.callToAction}</a>`
      : ''
  }</p>`;
}

function getMessage(messages) {
  const updateMessage = getUpdateMessage(messages);

  return `<div class="vertical-center"><p class="title">${messages.outOfDate}</p>${updateMessage}<p class="last"><a href="#" id="buttonCloseUpdateBrowser" title="${messages.close}">&times;</a></p></div>`;
}

function changeOpacity(elem, opacityValue) {
  elem.style.opacity = (opacityValue / 100).toString();
  elem.style.filter = `alpha(opacity=${opacityValue})`;
}

function fadeIn(elem, opacityValue) {
  changeOpacity(elem, opacityValue);
  if (opacityValue === 1) {
    elem.style.display = 'table';
  }
}


function main(options = {}) {
  const outdatedUI = getOutdatedElem();
  const messages = { ...locales.en, ...locales[options.locale], ...options.messages };

  // This is an outdated browser and the banner needs to show
  if (outdatedUI.style.opacity !== '1') {
    for (let opacity = 1; opacity <= 100; opacity++) {
      setTimeout(() => fadeIn(outdatedUI, opacity), opacity * 8);
    }
  }

  outdatedUI.innerHTML = getMessage(messages);

  document.getElementById('buttonCloseUpdateBrowser').onmousedown = () => {
    outdatedUI.style.display = 'none';
    return false;
  };
}

const options = typeof window !== 'undefined' && window.outdatedBrowserOptions;

// Load main when DOM ready.
if (typeof window.onload !== 'function') {
  window.onload = () => main(options);
} else {
  const oldOnload = window.onload;

  window.onload = function onload() {
    if (oldOnload) {
      oldOnload();
    }
    main(options);
  };
}
