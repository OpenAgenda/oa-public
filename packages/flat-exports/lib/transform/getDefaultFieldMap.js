'use strict';

const _ = require('lodash');
const getTargetField = require('./getTargetField');
const validateOptions = require('./options.validate.js');

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
  const cleanOptions = validateOptions(options);
  const getTarget = getTargetField.bind(null, cleanOptions.labels, cleanOptions.lang);
  // make a flat map.
  return [{
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
    postParse: data => (data ? data.join(cleanOptions.separator) : '')
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
      1: _.get(cleanOptions.labels, `contributor.${cleanOptions.lang}`, 'contributor'),
      2: _.get(cleanOptions.labels, `administrator.${cleanOptions.lang}`, 'administrator'),
      3: _.get(cleanOptions.labels, `moderator.${cleanOptions.lang}`, 'moderator')
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
    source: 'state',
    target: _.capitalize(getTarget('state')),
    transform: {
      '-1': _.capitalize(_.get(cleanOptions.labels, `refused.${cleanOptions.lang}`, 'refused')),
      0: _.capitalize(_.get(cleanOptions.labels, `tocontrol.${cleanOptions.lang}`, 'in moderation')),
      1: _.capitalize(_.get(cleanOptions.labels, `controlled.${cleanOptions.lang}`, 'ready to publish')),
      2: _.capitalize(_.get(cleanOptions.labels, `published.${cleanOptions.lang}`, 'published')),
    }
  }].map(c => _.get({
    timings: timings.bind(null, cleanOptions),
    accessibility: accessibility.bind(null, cleanOptions),
    multilingual: multilingual.bind(null, cleanOptions),
  }, c.type, defaultMap)(c));
};
