'use strict';

const marked = require('marked');
const sanitizeHtml = require('sanitize-html');

module.exports = md => sanitizeHtml(marked(md || '', { breaks: true }), {
  allowedTags: false,
  allowedAttributes: {
    h1: [],
    a: ['href'],
  },
});
