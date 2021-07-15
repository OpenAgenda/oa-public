'use strict';

const _ = require('lodash');
const labels = require('@openagenda/labels/event/accessibility');

module.exports = function ({ languages }, { target }) {
  const possibleLanguages = Object.keys(labels.hi);

  const targetLanguages = languages.filter(l => possibleLanguages ? possibleLanguages.includes(l) : true);

  return {
    source: 'accessibility',
    target: targetLanguages.map(l => (target || 'accessibility') + (languages.length > 1 ? ' - ' + l.toUpperCase() : '')),
    transform: v => targetLanguages
      .map(l => {
        return Object.keys(v??{}).filter(k => !!v[k]).map(code => labels[code][l]).join(' | ');
      })
  }
}
