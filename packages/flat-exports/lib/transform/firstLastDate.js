'use strict';

const moment = require('moment');

module.exports = ({ languages, includeLanguages }, { target, source, field }) => {
  let targetLanguages = languages;
  if (includeLanguages) {
    targetLanguages = targetLanguages.filter(l => (includeLanguages.includes(l)));
  }

  return {
    source,
    target: targetLanguages.map(l => (target || source) + (languages.length > 1 ? ` - ${l.toUpperCase()}` : '')),
    field: field === 'firstDate' ? 'firstDate' : 'lastDate',
    transform: ({ timings }) => {
      const firstDate = timings[0];
      const lastDate = timings[timings.length - 1];
      const timing = field === 'firstDate' ? firstDate : lastDate;

      return targetLanguages.map(lang => moment(timing.begin).locale(lang).format('dddd D MMMM YYYY'));
    }
  };
};
