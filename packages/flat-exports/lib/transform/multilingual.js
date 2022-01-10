'use strict';

const _ = require('lodash');

module.exports = ({ languages, includeLanguages }, {
  source, target, postParse, possibleLanguages
}) => {
  let targetLanguages = languages;

  if (possibleLanguages && includeLanguages) {
    targetLanguages = targetLanguages.filter(l => (possibleLanguages.includes(l) && includeLanguages.includes(l)));
  } else if (possibleLanguages) {
    targetLanguages = targetLanguages.filter(l => (possibleLanguages.includes(l)));
  } else if (includeLanguages) {
    targetLanguages = targetLanguages.filter(l => (includeLanguages.includes(l)));
  }

  return {
    source,
    target: targetLanguages.map(l => (target || source) + (languages.length > 1 ? ` - ${l.toUpperCase()}` : '')),
    transform: v => targetLanguages
      .map(l => {
        if (postParse) {
          return postParse(_.get(v, l));
        }
        return _.get(v, l, '');
      })
  };
};
