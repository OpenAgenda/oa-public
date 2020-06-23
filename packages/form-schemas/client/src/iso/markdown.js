'use strict';

const marked = require('marked');
const sanitizeHtml = require('sanitize-html');
const turndown = require('turndown');
const markdownLinkExtractor = require('markdown-link-extractor');
const log = require('debug')('markdown');

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

function convertTextLinks(md) {
  return markdownLinkExtractor(md).reduce(({ md, cursor }, link) => {
    const index = md.indexOf(link, cursor);
    const isMarkdownLink = (index > 2)
      && (md.substr(index + link.length, 1) === ')')
      && (md.substr(index - 2, 2) === '](');

    if (isMarkdownLink) {
      return {
        md,
        cursor: index + 1
      };
    }

    const before = md.substr(0, index - 1);
    const after = md.substr(index + link.length + 1);
    const markdownedLink = `[${link}](${link.replace('\\', '')})`;

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
  from: md => sanitizeHtml(marked(md || ''), {
    allowedTags: false,
    allowedAttributes: {
      h1: [],
      a: ['href']
    }
  })
}
