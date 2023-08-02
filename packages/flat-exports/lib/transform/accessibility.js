'use strict';

const labels = require('@openagenda/labels/event/accessibility');

module.exports = function accessibility({ languages, includeLanguages }, { target }) {
  const possibleLanguages = Object.keys(labels.hi);

  let targetLanguages = languages;

  if (possibleLanguages && includeLanguages) {
    targetLanguages = targetLanguages.filter(l => (possibleLanguages.includes(l) && includeLanguages.includes(l)));
  } else if (possibleLanguages) {
    targetLanguages = targetLanguages.filter(l => (possibleLanguages.includes(l)));
  } else if (includeLanguages) {
    targetLanguages = targetLanguages.filter(l => (includeLanguages.includes(l)));
  }

  return {
    source: 'accessibility',
    target: targetLanguages.map(l => (target || 'accessibility') + (languages.length > 1 ? ` - ${l.toUpperCase()}` : '')),
    transform: v => targetLanguages
      .map(l => Object.keys(v ?? {})
        .filter(k => !!v[k])
        .map(code => code)
        .map(code => labels[code][l])
        .join(' | ')),
  };
};
