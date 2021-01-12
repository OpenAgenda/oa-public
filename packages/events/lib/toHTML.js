'use strict';

const marked = require('marked');
const renderer = new marked.Renderer();
const toHTML = str => marked(str || '', { renderer });

module.exports = obj => {
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((html, lang) => ({
      ...html,
      [lang]: toHTML(obj[lang])
    }), {});
  } else {
    return toHTML(obj);
  }
}