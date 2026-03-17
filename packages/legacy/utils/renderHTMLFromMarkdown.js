import { fromMarkdownToHTML } from '@openagenda/md';

export default (services, options = {}, links = null, md = '') => {
  const { oembed } = services;

  const { includeEmbedded = false } = options;

  const html = fromMarkdownToHTML(md, { sanitize: false });

  if (!links || !includeEmbedded) {
    return html;
  }

  return oembed.injectEmbeds(html, links);
};
