'use strict';

const _ = require('lodash');
const moment = require('moment');
const schema = require('@openagenda/validators/schema');
const { cleanString } = require('@openagenda/utils');

const textValidator = require('@openagenda/validators/text');
const passValidator = require('@openagenda/validators/pass');

schema.register({
  text: textValidator,
  pass: passValidator,
});

const formatDescription = (description, dateRange, html = '') => `<strong>${dateRange}</strong><p>${description}</p>${cleanString(html)}`;
const pickLanguage = (event, lang) => (event.title[lang] ? lang : Object.keys(event.title)[0]);

const validateOptions = schema({
  lang: {
    type: 'text',
    default: 'fr',
  },
  genUrl: {
    type: 'pass',
    default: data => `https://openagenda.com/events/${data.uid}`,
  },
});

module.exports = (event, options = {}) => {
  const cleanOptions = validateOptions(options);
  const lang = pickLanguage(event, cleanOptions.lang);

  return _.extend({
    title: _.get(event, `title.${lang}`, ''),
    description: formatDescription(
      _.get(event.description, lang, ''),
      _.get(event.dateRange, lang, event.dateRange.fr),
      _.get(event.html, lang, ''),
    ),
    url: cleanOptions.genUrl(event),
    guid: [
      _.get(event, 'agenda.uid', null),
      event.uid,
    ].filter(v => !!v).join('/'),
    date: event.updatedAt,
    lat: _.get(event, 'location.latitude', null),
    long: _.get(event, 'location.longitude', null),
    custom_elements: [{
      'ev:startdate': moment(_.first(event.timings).begin).format('YYYY-MM-DDTHH:mm:ss'),
    }, {
      'ev:enddate': moment(_.last(event.timings).end).format('YYYY-MM-DDTHH:mm:ss'),
    }, {
      'ev:location': [_.get(event, 'location.name'), _.get(event, 'location.address')].filter(v => v).join(' - '),
    }],
  }, event.image ? {
    enclosure: {
      url: (event.image.base + event.image.filename).replace('https://', 'http://'),
      type: 'image/jpeg',
    },
  } : {});
};
