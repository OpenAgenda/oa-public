'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');
const esc = require('./escape');
const foldLine = require('./foldLine');

schema.register({
  text: require('@openagenda/validators/text'),
});

const validate = schema({
  slug: {
    type: 'text',
    optional: false,
  },
  identifier: {
    type: 'text',
    optional: false,
  },
  type: {
    type: 'text',
    default: 'agenda',
  },
  lang: {
    type: 'text',
    default: 'fr',
  },
  title: {
    type: 'text',
    default: 'ics',
  },
  description: {
    type: 'text',
    default: 'agenda export',
  },
});

module.exports = data => {
  const {
    slug,
    identifier,
    type,
    lang,
    title,
    description,
  } = _.mapValues(validate(data), esc);

  return `${[
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${slug}//${type}//${lang}`,
    'METHOD:PUBLISH',
    foldLine(`X-WR-CALNAME:${title}`),
    foldLine(`X-WR-CALDESC:${description}`),
    `X-WR-RELCALID:${identifier}`,
  ].join('\r\n')}\r\n`;
};
