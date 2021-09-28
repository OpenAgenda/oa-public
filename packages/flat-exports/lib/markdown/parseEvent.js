'use strict';

const fs = require('fs');
const _ = require('lodash');

const txtRender = _.template(fs.readFileSync(`${__dirname}/txtEvent.tpl`, 'utf-8'));

const mdRender = _.template(fs.readFileSync(`${__dirname}//mdEvent.tpl`, 'utf-8'));

const labels = require('@openagenda/labels/exports/text');
const accessibilityLabels = require('@openagenda/labels/event/accessibility');
const attendanceModeLabels = require('@openagenda/labels/event/form');
const flatten = require('@openagenda/labels/flatten');

function get(value, preferredLang) {
  const existing = _.keys(value);

  if (!existing || !existing.length) return '';

  return _.get(value, preferredLang, value[existing[0]]);
}

module.exports = (format, { genUrl, lang, section }, data, { previous }) => {
  const { location } = data;

  const flatAccessibilityLabels = flatten(accessibilityLabels, lang);
  const flatAttendanceModeLabels = flatten(attendanceModeLabels, lang);

  const labelsByMode = [
    {
      code: 2,
      label: flatAttendanceModeLabels.onlineAttendanceMode
    },
    {
      code: 3,
      label: flatAttendanceModeLabels.mixedAttendanceMode
    }
  ];

  return (format === 'md' ? mdRender : txtRender)({
    title: get(data.title, lang),
    link: genUrl(data),
    labels: flatten(labels, lang),
    description: get(data.description, lang),
    dateRange: get(data.dateRange, lang),
    registration: data.registration,
    location: location
      ? {
        name: location.name,
        address: location.address,
        access: get(location.access, lang),
        latitude: location.latitude,
        longitude: location.longitude,
      }
      : null,
    accessibility: _.keys(data.accessibility)
      .filter(k => data.accessibility[k])
      .map(k => flatAccessibilityLabels[k]),
    longDescription: get(data.longDescription, lang),
    sectionValue: _.get(previous, section) !== _.get(data, section) ? _.get(data, section) : null,
    image: data.image ? data.image.base + data.image.filename : null,
    onlineAccessLink: data.onlineAccessLink,
    attendanceMode: {
      onlineAccessLinkLabel: flatAttendanceModeLabels.onlineAccessLink,
      attendanceModeLabel: flatAttendanceModeLabels.attendanceMode,
      mode: labelsByMode.find(label => label.code === data.attendanceMode)?.label,
    },
  });
};
