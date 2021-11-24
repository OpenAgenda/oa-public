'use strict';

const _ = require('lodash');
const getTargetField = require('./getTargetField');

const multilingual = require('./multilingual');
const accessibility = require('./accessibility');
const timings = require('./timings');

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
    field: 'timings',
    type: 'timings',
    target: getTarget('timings'),
    isoTarget: getTarget('isoTimings')
  }, {
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
  }];

  if (options.includeFields) {
    fields = fields.filter(field => options.includeFields.includes(field.source));
  }

  // make a flat map.
  return fields.map(c => _.get({
    timings: timings.bind(null, options),
    accessibility: accessibility.bind(null, options),
    multilingual: multilingual.bind(null, options),
  }, c.type, defaultMap)(c));
};
