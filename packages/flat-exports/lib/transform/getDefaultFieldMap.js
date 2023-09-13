'use strict';

const _ = require('lodash');

const getTargetField = require('./getTargetField');
const multilingual = require('./multilingual');
const accessibility = require('./accessibility');
const timings = require('./timings');
const formatTime = require('./formatTime');
const image = require('./image');
const registration = require('./registration');
const age = require('./age');
const firstLastDate = require('./firstLastDate');
const permalink = require('./permalink');

const defaultMap = c => ({
  source: c.source,
  target: c.target || c.source,
  ...c.transform ? { transform: c.transform } : {},
});

module.exports = function getDefaultFieldMap(options = {}) {
  const labelLanguages = ['fr', 'en'];

  const {
    labels = {},
    lang,
    includeFields = [],
  } = options;

  const subOptions = {
    languages: [],
    ...options,
  };

  const getTarget = getTargetField.bind(null, labels, lang);

  let fields = [{
    source: 'uid',
    target: getTarget('uid'),
  }, {
    source: 'title',
    target: getTarget('title'),
    type: 'multilingual',
  }, {
    source: 'description',
    target: getTarget('description'),
    type: 'multilingual',
  }, {
    source: 'longDescription',
    target: getTarget('longDescription'),
    type: 'multilingual',
  }, {
    source: 'uid',
    target: getTarget('permalink'),
    type: 'permalink',
    field: 'permalink',
  }, {
    source: 'keywords',
    target: getTarget('keywords'),
    type: 'multilingual',
    postParse: data => (data ? data.join(options.separator) : ''),
  }, {
    source: 'dateRange',
    target: getTarget('range'),
    type: 'multilingual',
    possibleLanguages: labelLanguages,
  }, {
    source: 'timings',
    field: 'timings',
    type: 'timings',
    target: getTarget('timings'),
    isoTarget: getTarget('isoTimings'),
  }, {
    source: 'timings',
    target: getTarget('firstDate'),
    type: 'firstLastDate',
    field: 'firstDate',
  },
  {
    source: 'timings',
    target: getTarget('lastDate'),
    type: 'firstLastDate',
    field: 'lastDate',
  },
  {
    source: 'conditions',
    target: getTarget('conditions'),
    type: 'multilingual',
  }, {
    source: 'accessibility',
    type: 'accessibility',
    target: getTarget('accessibility'),
  }, {
    source: 'createdAt',
    target: getTarget('createdAt'),
    type: 'time',
  }, {
    source: 'updatedAt',
    target: getTarget('updatedAt'),
    type: 'time',
  }, {
    source: 'image',
    target: getTarget('image'),
    type: 'image',
  }, {
    source: 'thumbnail',
    target: getTarget('thumbnail'),
  }, {
    source: 'onlineAccessLink',
    target: getTarget('onlineAccessLink'),
  }, {
    source: 'registration',
    target: getTarget('registration'),
    type: 'registration',
  }, {
    source: 'featured',
    target: _.capitalize(getTarget('featured')),
    transform: {
      true: _.capitalize(getTarget('featured')),
      false: null,
    },
  }, {
    source: 'age',
    target: getTarget('age'),
    type: 'age',
  }, {
    source: 'originAgenda.title',
    target: getTarget('origin.title'),
  }, {
    source: 'originAgenda.uid',
    target: getTarget('origin.uid'),
  }, {
    source: 'link',
    target: getTarget('link'),
  }, {
    source: 'state',
    target: _.capitalize(getTarget('state')),
    transform: {
      '-1': _.capitalize(_.get(labels, `refused.${lang}`, 'refused')),
      0: _.capitalize(_.get(labels, `tocontrol.${lang}`, 'in moderation')),
      1: _.capitalize(_.get(labels, `controlled.${lang}`, 'ready to publish')),
      2: _.capitalize(_.get(labels, `published.${lang}`, 'published')),
    },
  }];

  if (includeFields.length) {
    fields = fields.filter(field => {
      if (field.field) {
        return includeFields.includes(field.field);
      }
      return includeFields.includes(field.source);
    });
  }

  // make a flat map.
  return fields.map(c => _.get({
    timings: timings.bind(null, subOptions),
    accessibility: accessibility.bind(null, subOptions),
    multilingual: multilingual.bind(null, subOptions),
    time: formatTime.bind(null, subOptions),
    firstLastDate: firstLastDate.bind(null, subOptions),
    image: image.bind(null),
    registration: registration.bind(null, { source: c.source, target: c.target }),
    age: age.bind(null, { source: c.source, target: c.target }),
    permalink: permalink.bind(null, subOptions, { source: c.source, target: c.target }),
  }, c.type, defaultMap)(c));
};
