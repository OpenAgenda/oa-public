'use strict';

const marked = require('marked');
const sanitizeHtml = require('sanitize-html');
const turndown = require('turndown');

const TurndownService = turndown.default || turndown;

const ts = new TurndownService();

marked.use({
  tokenizer: {
    link(src) {
      if (src.length === 1) {
        // marked bug: a \ screws output, adds last character of given input
        return {
          type: 'text',
          raw: ' ',
          text: ''
        }
      } else if (src.indexOf('\\_') !== -1) {
        const clean = src.replace('\\_', '_');
        return {
          type: 'link',
          raw: clean,
          href: clean,
          text: clean
        }
      }

      return false;
    }
  }
});

module.exports = {
  to: html => ts.turndown(html || ''),
  from: md => sanitizeHtml(marked(md || ''), {
    allowedTags: false,
    allowedAttributes: {
      h1: [],
      a: ['href']
    }
  })
}
