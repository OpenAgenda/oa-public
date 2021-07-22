'use strict';

const log = require('@openagenda/logs')('core/agendas/events/convertLongDescription');

const {
  produce
} = require('immer');

const conversions = ['HTML', 'HTMLWithEmbeds'];

function convert(services, conversion, links = [], md = '') {
  const {
    formSchemas,
    oembed
  } = services;

  const HTML = formSchemas.utils.markdown.from(md);

  if (!links || conversion !== 'HTMLWithEmbeds') {
    return HTML;
  }

  return oembed.injectEmbeds(HTML, links);
}

function shouldConvert(longDescription, conversion) {
  if (!conversions.includes(conversion)) {
    return false;
  }

  return !!longDescription;
}

function convertField({ links, longDescription }, { services, conversion }) {
  log('convertField');
  if (typeof longDescription === 'string') {
    return convert(services, conversion, links, longDescription);
  }

  return Object.keys(longDescription)
    .reduce((converted, lang) => Object.assign(converted, {
      [lang]: convert(services, conversion, links, longDescription[lang])
    }), {});
}

module.exports = convertField;

module.exports.shouldConvert = shouldConvert;

module.exports.load = ({ services, conversion }) => event => produce(event, draft => {
  if (!shouldConvert(event.longDescription, conversion)) {
    return false;
  }

  draft.longDescription = convertField(event, { services, conversion });
});

module.exports.conversions = conversions;
