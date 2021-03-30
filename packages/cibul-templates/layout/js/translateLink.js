'use strict';

const Cookies = require('js-cookie');

module.exports = function translateLink() {
  const btn = document.querySelector('.js_header_links .translate-button');

  if (btn) {
    btn.addEventListener('click', () => {
      console.log('Click', Cookies.get('translateMode'));

      if (Cookies.get('translateMode')) {
        Cookies.remove('translateMode');
      } else {
        Cookies.set('translateMode', 'true');
      }

      document.location.reload();
    });
  }
};
