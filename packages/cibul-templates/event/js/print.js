'use strict'

module.exports = (selector = '.js_print') => {
  const el = document.querySelector(selector);

  el?.addEventListener('click', e => {
    e.preventDefault();

    window.print();
  });
}
