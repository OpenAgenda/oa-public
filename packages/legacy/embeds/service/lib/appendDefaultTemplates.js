'use strict';

const _ = require('lodash');

module.exports = (item, defaultTemplates) => {
  ['event', 'eventitem', 'header'].forEach(templateField => {
    if (!item?.template?.[templateField] && defaultTemplates?.[templateField]) {
      _.set(item, ['template', templateField], defaultTemplates[templateField]);
    }
  });
  return item;
};
