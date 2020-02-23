'use strict';

const _ = require('lodash');

module.exports = (oembed, text, current = [] ) => {
  if (!oembed) return []
  return oembed.fromMarkdown(_.keys(text).reduce((concatenated, lang) => [
    concatenated, _.get(text, lang)
  ].join('\n'), ''), {
    current
  }).then(links => links.map(link => _.set(link, 'type', 'oembed')));
}
