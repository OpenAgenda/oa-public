'use strict';

const moment = require('moment-timezone');

const possibleLanguages = ['fr', 'en', 'it', 'es', 'de'];

module.exports = ({ languages, includeLanguages }, { target, isoTarget }) => {
  const source = 'timings';

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
    target: [isoTarget || 'ISO'].concat(targetLanguages.map(l => (target || source) + (languages.length > 1 ? ` - ${l.toUpperCase()}` : ''))),
    transform: event => {
      const columns = [[]].concat(targetLanguages.map(() => []));

      let cursor;

      (event.timings ?? []).forEach(t => {
        // pop out timezone info
        const begin = t.begin.replace(/(\+|-)[0-9][0-9]:[0-9][0-9]$/, '');
        const end = t.end.replace(/(\+|-)[0-9][0-9]:[0-9][0-9]$/, '');

        // check if there is a change in date
        const beginDate = moment(begin).format('YYYYDDDD');
        const dateChanged = cursor !== beginDate;

        cursor = beginDate;

        // set iso values
        columns[0].push([t.begin, t.end].join(' -> '));

        targetLanguages.forEach((l, i) => {
          if (dateChanged) {
            columns[i + 1].push([
              moment.tz(begin, event.timezone).locale(l).format('dddd D MMMM YYYY - HH:mm'),
              moment.tz(end, event.timezone).locale(l).format('HH:mm')
            ].join(' ⤏ '));
          } else {
            columns[i + 1][columns[i + 1].length - 1] += `, ${[
              moment(begin).locale(l).format('HH:mm'),
              moment(end).locale(l).format('HH:mm')
            ].join(' ⤏ ')}`;
          }
        });
      });
      return columns.map(c => c.join(' | '));
    }
  };
};
