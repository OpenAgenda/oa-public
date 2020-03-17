'use strict';

const MAX_LENGTH = 140;

const getLabel = require('@openagenda/labels')(
  require('@openagenda/labels/event/show')
).bind(null, 'cancelled');

module.exports = title => Object.keys(title).reduce((cancelled, lang) => ({
  ...cancelled,
  [lang]: _truncateIfTooLong(getLabel(lang) + ' | ' + title[lang])
}), {});


function _truncateIfTooLong(str) {
  if (str.length >= MAX_LENGTH - 3) {
    return str.substr(0, MAX_LENGTH - 3) + '...';
  } else {
    return str;
  }
}
