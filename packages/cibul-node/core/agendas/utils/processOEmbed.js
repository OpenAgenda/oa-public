'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/utils/processOEmbed');

module.exports = (oembed, text, current = []) => {
  if (!oembed) {
    log('oembed service is not initialized');
    return [];
  }
  log('processing oembed');
  return oembed.fromMarkdown(_.keys(text).reduce((concatenated, lang) => [
    concatenated, _.get(text, lang)
  ].join('\n'), ''), {
    current
  }).then(links => links.map(link => _.set(link, 'type', 'oembed')));
}
