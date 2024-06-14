'use strict';

const { fromMarkdownToHTML } = require('@openagenda/md');

module.exports = obj => {
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((html, lang) => ({
      ...html,
      [lang]: fromMarkdownToHTML(obj[lang]),
    }), {});
  }
  return fromMarkdownToHTML(obj);
}