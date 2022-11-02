'use strict';

module.exports = (services, options = {}, links = null, md = '') => {
  const {
    oembed,
    formSchemas
  } = services;

  const {
    includeEmbedded = false
  } = options;

  const html = formSchemas.utils.markdown.from(md);

  if (!links || !includeEmbedded) {
    return html;
  }

  return oembed.injectEmbeds(html, links);
};
