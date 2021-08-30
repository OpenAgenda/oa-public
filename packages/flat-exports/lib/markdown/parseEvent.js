'use strict';

const fs = require('fs');
const _ = require('lodash');

const txtRender = _.template(fs.readFileSync(`${__dirname}/txtEvent.tpl`, 'utf-8'));

const mdRender = _.template(fs.readFileSync(`${__dirname}//mdEvent.tpl`, 'utf-8'));

const labels = require('@openagenda/labels/exports/text');
const accessibilityLabels = require('@openagenda/labels/event/accessibility');
const flatten = require('@openagenda/labels/flatten');

function get(value, preferredLang) {
  const existing = _.keys(value);

  if (!existing || !existing.length) return '';

  return _.get(value, preferredLang, value[existing[0]]);
}

module.exports = (format, { genUrl, lang, section }, data, { previous }) => {
  const { location } = data;

  const flatAccessibilityLabels = flatten(accessibilityLabels, lang);

  return (format === 'md' ? mdRender : txtRender)({
    title: get(data.title, lang),
    link: genUrl(data),
    labels: flatten(labels, lang),
    description: get(data.description, lang),
    dateRange: get(data.dateRange, lang),
    registration: data.registration,
    location: {
      name: location.name,
      address: location.address,
      access: get(location.access, lang),
      latitude: location.latitude,
      longitude: location.longitude
    },
    accessibility: _.keys(data.accessibility).filter(k => data.accessibility[k]).map(k => flatAccessibilityLabels[k]),
    longDescription: get(data.longDescription, lang),
    sectionValue: _.get(previous, section) !== _.get(data, section) ? _.get(data, section) : null
  });
};
