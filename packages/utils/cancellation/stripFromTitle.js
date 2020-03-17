'use strict';

const getLabel = require('@openagenda/labels')(
  require('@openagenda/labels/event/show')
).bind(null, 'cancelled');

module.exports = title => Object.keys(title)
  .reduce((uncancelled, lang) => ({
    ...uncancelled,
    [lang]: title[lang].replace(getLabel(lang) + ' | ', '')
  }), {});
