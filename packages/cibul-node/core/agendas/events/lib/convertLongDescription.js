'use strict';

const log = require('@openagenda/logs')('core/agendas/events/convertLongDescription');
const { produce } = require('immer');

const conversions = ['HTML', 'HTMLWithEmbeds'];

function convert(params, links = [], md = '') {
  const {
    services,
    conversion,
    includeEmbedScripts,
    cspNonce,
  } = params;
  const {
    formSchemas,
    oembed,
  } = services;

  const HTML = formSchemas.utils.markdown.from(md);

  if (!links || conversion !== 'HTMLWithEmbeds') {
    return HTML;
  }

  const HTMLWithEmbeds = oembed.injectEmbeds(HTML, links, {
    includeEmbedScripts,
    cspNonce,
  });

  return HTMLWithEmbeds;
}

function shouldConvert(longDescription, conversion) {
  if (!conversions.includes(conversion)) {
    return false;
  }

  return !!longDescription;
}

function convertField({ links, longDescription }, params) {
  log('convertField to format %s', params.conversion);
  if (typeof longDescription === 'string') {
    return convert(params, links, longDescription);
  }

  return Object.keys(longDescription)
    .reduce((converted, lang) => Object.assign(converted, {
      [lang]: convert(params, links, longDescription[lang]),
    }), {});
}

module.exports = convertField;

module.exports.shouldConvert = shouldConvert;

module.exports.load = ({
  services,
  conversion,
  includeEmbedScripts,
  cspNonce,
}) => event => produce(event, draft => {
  if (!shouldConvert(event.longDescription, conversion)) {
    return;
  }

  draft.longDescription = convertField(event, { services, conversion, includeEmbedScripts, cspNonce });
});

module.exports.conversions = conversions;
