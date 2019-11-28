'use strict';

const marked = require('marked');
const sanitizeHtml = require('sanitize-html');
const turndown = require('turndown');

const TurndownService = turndown.default || turndown;

const ts = new TurndownService();

module.exports = {
  to: html => ts.turndown(html || ''),
  from: md => sanitizeHtml(marked(md || ''), {
    allowedTags: false,
    allowedAttributes: {
      h1: []
    }
  })
}
