'use strict';

const _ = require('lodash');
const marked = require('marked');
const sanitizeHtml = require('sanitize-html');
const turndown = require('turndown');
const markdownLinkExtractor = require('markdown-link-extractor');
const log = require('debug')('markdown');

const TurndownService = turndown.default || turndown;

const ts = new TurndownService();

ts.addRule('line', {
  filter: ['p'],
  replacement: function (content) {
    return content + '\n';
  }
});

function convertTextLinks(md) {
  return markdownLinkExtractor(md).reduce(({ md, cursor }, link) => {
    const unescapedLink = _.unescape(link);
    const index = md.indexOf(unescapedLink, cursor);
    const isMarkdownLink = (index > 2)
      && (md.substr(index + unescapedLink.length, 1) === ')')
      && (md.substr(index - 2, 2) === '](');

    if (isMarkdownLink) {
      return {
        md,
        cursor: index + 1
      };
    }

    const before = md.substr(0, index);
    const after = md.substr(index + unescapedLink.length);

    const markdownedLink = `[${unescapedLink}](${unescapedLink.replace(/\\/g, '')})`;

    return {
      md: before + markdownedLink + after,
      cursor: index + markdownedLink.length
    };

  }, { md, cursor: 0 }).md;
}

module.exports = {
  to: html => {
    const md = ts.turndown(html || '');

    return convertTextLinks(md);
  },
  from: (md = '') => {
    const mk = marked(md.replace(/\n\n/g, 'doublelinebreak\n'), { breaks: true, headerIds: false })
      .replace(/<br>/g, '</p>\n<p>')
      .replace(/doublelinebreak<\/p>/g, '</p>\n<p></p>')
      .replace(/doublelinebreak<\/h3>/g, '</h3>\n<p></p>')

    return sanitizeHtml(mk, {
      allowedTags: false,
      allowedAttributes: {
        h1: [],
        a: ['href']
      }
    });
  }
}
