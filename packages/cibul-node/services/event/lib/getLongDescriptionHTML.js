'use strict';

const {
  fromMarkdownToHTML,
} = require('@openagenda/md');

function renderHTMLFromMarkdown(services, links = null, md = '') {
  const {
    oembed,
  } = services;

  const html = fromMarkdownToHTML(md);

  if (!links) {
    return html;
  }

  return oembed.injectEmbeds(html, links);
}

module.exports = (options, multilingualText = {}, links = []) => {
  const {
    services,
    lang,
    useFallbackLang,
  } = {
    services: null,
    lang: null,
    useFallbackLang: true,
    ...options,
  };

  const render = renderHTMLFromMarkdown.bind(null, services, links);

  if (typeof multilingualText === 'string') return render(multilingualText);

  if (!lang) {
    return Object.keys(multilingualText).reduce((htmlObj, l) => ({
      ...htmlObj,
      [l]: render(multilingualText[l]),
    }), {});
  }

  if (Object.keys(multilingualText).includes(lang)) {
    return render(multilingualText[lang]);
  }

  if (useFallbackLang) {
    return render(multilingualText[Object.keys(multilingualText)[0]]);
  }

  return '';
};

module.exports.renderHTMLFromMarkdown = renderHTMLFromMarkdown;
