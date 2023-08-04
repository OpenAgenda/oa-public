'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/utils/processOEmbed');

module.exports = (
  oembed,
  text,
  {
    current = [],
    includeEmbedlessLinks = true,
    filterInvalidLinks = true,
    lazy = true,
  },
) => {
  if (!oembed) {
    log('oembed service is not initialized');
    return [];
  }

  log('processing oembed');
  return oembed.fromMarkdown(Object.values(text).join('\n'), {
    current, includeEmbedlessLinks, filterInvalidLinks, lazy,
  }).then(links => links.map(link => _.set(link, 'type', 'oembed')));
};
