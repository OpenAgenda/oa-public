const _ = require('lodash');
const marked = require('marked');
const sanitizeHtml = require('sanitize-html');
const turndown = require('turndown');
const markdownLinkExtractor = require('markdown-link-extractor');

const TurndownService = turndown.default || turndown;

const ts = new TurndownService();

ts.addRule('line', {
  filter: ['p'],
  replacement: content => [content, '\n'].join('')
});

function convertTextLinks(markdownInput) {
  return markdownLinkExtractor(markdownInput).reduce(({ md, cursor }, link) => {
    const unescapedLink = _.unescape(link);
    const linkAsInInput = unescapedLink.replace(/^mailto:/, '');

    const index = md.indexOf(linkAsInInput, cursor);
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
    const after = md.substr(index + linkAsInInput.length);

    const markdownedLink = `[${linkAsInInput}](${unescapedLink.replace(/\\/g, '')})`;
    return {
      md: before + markdownedLink + after,
      cursor: index + markdownedLink.length
    };
  }, { md: markdownInput, cursor: 0 }).md;
}

module.exports = {
  to: html => convertTextLinks(ts.turndown(html || '')),
  from: md => {
    const html = (md || '').split('\n\n').map(markdown => marked(markdown, { breaks: true })).join('<p></p>\n');

    return sanitizeHtml(html, {
      allowedTags: false,
      allowedAttributes: {
        h1: [],
        a: ['href']
      }
    });
  }
};
