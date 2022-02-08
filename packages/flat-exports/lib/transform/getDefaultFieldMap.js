'use strict';

const _ = require('lodash');

const getTargetField = require('./getTargetField');
const multilingual = require('./multilingual');
const accessibility = require('./accessibility');
const timings = require('./timings');
const formatTime = require('./formatTime');
const image = require('./image');
const registration = require('./registration');
const firstLastDate = require('./firstLastDate');
const permalink = require('./permalink');

const defaultMap = c => ({
  source: c.source,
  target: c.target || c.source,
  ...(c.transform ? { transform: c.transform } : {})
});

module.exports = function getDefaultFieldMap(options) {
  const labelLanguages = ['fr', 'en'];
  const getTarget = getTargetField.bind(null, options.labels, options.lang);

  let fields = [{
    source: 'uid',
    target: getTarget('uid')
  }, {
    source: 'title',
    target: getTarget('title'),
    type: 'multilingual'
  }, {
    source: 'description',
    target: getTarget('description'),
    type: 'multilingual'
  }, {
    source: 'longDescription',
    target: getTarget('longDescription'),
    type: 'multilingual'
  }, {
    source: 'uid',
    target: getTarget('permalink'),
    type: 'permalink',
    field: 'permalink'
  }, {
    source: 'keywords',
    target: getTarget('keywords'),
    type: 'multilingual',
    postParse: data => (data ? data.join(options.separator) : '')
  }, {
    source: 'dateRange',
    target: getTarget('range'),
    type: 'multilingual',
    possibleLanguages: labelLanguages
  }, {
    source: 'timings',
    field: 'timings',
    type: 'timings',
    target: getTarget('timings'),
    isoTarget: getTarget('isoTimings')
  }, {
    source: 'timings',
    target: getTarget('firstDate'),
    type: 'firstLastDate',
    field: 'firstDate'
  },
  {
    source: 'timings',
    target: getTarget('lastDate'),
    type: 'firstLastDate',
    field: 'lastDate'
  },
  {
    source: 'conditions',
    target: getTarget('conditions'),
    type: 'multilingual'
  }, {
    type: 'accessibility',
    target: getTarget('accessibility')
  }, {
    source: 'location.uid',
    target: getTarget('location.uid')
  }, {
    source: 'location.name',
    target: getTarget('location.name')
  }, {
    source: 'location.address',
    target: getTarget('location.address')
  }, {
    source: 'location.city',
    target: getTarget('location.city')
  }, {
    source: 'location.department',
    target: getTarget('location.department')
  }, {
    source: 'location.region',
    target: getTarget('location.region')
  }, {
    source: 'location.latitude',
    target: getTarget('location.latitude')
  }, {
    source: 'location.longitude',
    target: getTarget('location.longitude')
  }, {
    source: 'country',
    type: 'multilingual',
    target: getTarget('location.countryCode'),
    possibleLanguages: labelLanguages
  }, {
    source: 'location.image',
    target: getTarget('location.image')
  }, {
    source: 'location.imageCredits',
    target: getTarget('location.imageCredits')
  }, {
    source: 'location.description',
    target: getTarget('location.description'),
    type: 'multilingual'
  }, {
    source: 'location.access',
    target: getTarget('location.access'),
    type: 'multilingual'
  },
  {
    source: 'location.phone',
    target: getTarget('location.phone')
  },
  {
    source: 'member.uid',
    target: getTarget('member.uid')
  }, {
    source: 'member.name',
    target: getTarget('member.name')
  }, {
    source: 'member.role',
    target: getTarget('member.role'),
    transform: {
      1: _.get(options.labels, `contributor.${options.lang}`, 'contributor'),
      2: _.get(options.labels, `administrator.${options.lang}`, 'administrator'),
      3: _.get(options.labels, `moderator.${options.lang}`, 'moderator')
    }
  }, {
    source: 'member.organization',
    target: getTarget('member.organization')
  }, {
    source: 'member.position',
    target: getTarget('member.position')
  }, {
    source: 'member.email',
    target: getTarget('member.email')
  }, {
    source: 'member.phone',
    target: getTarget('member.phone')
  }, {
    source: 'createdAt',
    target: getTarget('createdAt'),
    type: 'time'
  }, {
    source: 'updatedAt',
    target: getTarget('updatedAt'),
    type: 'time'
  }, {
    source: 'image',
    target: getTarget('image'),
    type: 'image'
  }, {
    source: 'thumbnail',
    target: getTarget('thumbnail')
  }, {
    source: 'onlineAccessLink',
    target: getTarget('onlineAccessLink')
  }, {
    source: 'registration',
    target: getTarget('registration'),
    type: 'registration'
  }, {
    source: 'featured',
    target: _.capitalize(getTarget('featured')),
    transform: {
      true: _.capitalize(getTarget('featured')),
      false: null
    }
  }, {
    source: 'age.min',
    target: getTarget('age.min')
  }, {
    source: 'age.max',
    target: getTarget('age.max')
  }, {
    source: 'originAgenda.title',
    target: getTarget('origin.title')
  }, {
    source: 'originAgenda.uid',
    target: getTarget('origin.uid')
  }, {
    source: 'link',
    target: getTarget('link')
  }, {
    source: 'state',
    target: _.capitalize(getTarget('state')),
    transform: {
      '-1': _.capitalize(_.get(options.labels, `refused.${options.lang}`, 'refused')),
      0: _.capitalize(_.get(options.labels, `tocontrol.${options.lang}`, 'in moderation')),
      1: _.capitalize(_.get(options.labels, `controlled.${options.lang}`, 'ready to publish')),
      2: _.capitalize(_.get(options.labels, `published.${options.lang}`, 'published')),
    }
  }];

  if (options.includeFields) {
    fields = fields.filter(field => {
      if (field.field) {
        return options.includeFields.includes(field.field);
      }
      return options.includeFields.includes(field.source);
    });
  }

  // make a flat map.
  return fields.map(c => _.get({
    timings: timings.bind(null, options),
    accessibility: accessibility.bind(null, options),
    multilingual: multilingual.bind(null, options),
    time: formatTime.bind(null, options),
    firstLastDate: firstLastDate.bind(null, options),
    image: image.bind(null),
    registration: registration.bind(null, { source: c.source, target: c.target }),
    permalink: permalink.bind(null, options, { source: c.source, target: c.target })
  }, c.type, defaultMap)(c));
};
