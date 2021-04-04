'use strict';

const _ = require('lodash');
const { produce } = require('immer');

module.exports = (fields, languages = [], event) => {
  if (!languages.length) {
    return event;
  }

  return produce(event, draft => {
    const candidateFields = fields.filter(f => _.isObject(draft[f]));
  
    for (const field of candidateFields) {
      const language = [].concat(languages).filter(l => draft[field][l]).shift();
      draft[field] = draft[field][language];
    }
  });
}