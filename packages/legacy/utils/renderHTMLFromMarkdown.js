'use strict';

const {
  fromMarkdownToHTML,
} = require('@openagenda/md');

module.exports = (services, options = {}, links = null, md = '') => {
  const {
    oembed,
  } = services;

  const {
    includeEmbedded = false,
  } = options;

  const html = fromMarkdownToHTML(md);

  if (!links || !includeEmbedded) {
    return html;
  }

  return oembed.injectEmbeds(html, links);
};
