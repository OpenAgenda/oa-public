'use strict';

module.exports = (services, links = null, md = '') => {
  const {
    oembed,
    formSchemas
  } = services;

  const html = formSchemas.utils.markdown.from(md);

  if (!links) {
    return html;
  }

  return oembed.injectEmbeds(html, links);
};
