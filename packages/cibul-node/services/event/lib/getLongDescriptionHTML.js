'use strict';

module.exports = ({
  lang,
  services
}, multilingualText, links) => {

  const render = _render.bind(null, services, links);

  if (typeof multilingualText === 'string') return render(multilingualText);

  if (!lang) {
    return Object.keys(multilingualText).reduce((htmlObj, lang) => ({
      ...htmlObj,
      [lang]: render(multilingualText[lang])
    }), {});
  }

  if (Object.keys(multilingualText).includes(lang)) {
    return render(multilingualText[lang]);
  }

  return render(multilingualText[Object.keys(multilingualText)[0]]);
}

function _render(services, links = null, md = '') {
  const {
    oembed,
    formSchemas
  } = services;

  const html = formSchemas.utils.markdown.from(md);

  if (!links) {
    return html;
  }

  return oembed.injectEmbeds(html, links);
}
