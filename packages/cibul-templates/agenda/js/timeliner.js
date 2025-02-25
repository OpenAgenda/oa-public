"use strict";

const labels = require('@openagenda/labels/widgets/relative');
const makeLabelGetter = require('@openagenda/labels');

const today = new Date();
const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const dom = require('./timeliner.dom');
const monthTime = 24*60*60*1000*30; // approx
const yearTime = 24*60*60*1000*365; // less approx

module.exports = function(lang) {
  const l = labelizer(makeLabelGetter(labels, lang));

  return Object.assign(l, {
    dom: dom(l)
  });
}

function labelizer(getLabel) {
  return dt => {
    let diff = _diff(dt);
    let unit;
    let unitLabel = 'days';
    let label;

    if (Math.abs(diff) > 365*2) {
       unit = yearTime;
       unitLabel = 'years';
    } else if (Math.abs(diff) > 60) {
      unit = monthTime;
      unitLabel = 'months';
    }

    if (unitLabel !== 'days') { // means we need to recalculate
      diff = _diff(dt, unit);
    }

    label = (diff < 0 ? 'relativeToNowPast' : 'relativeToNowUpcoming');

    if (unitLabel === 'days') {
      if (diff === 0) {
        return getLabel('today');
      }
      if (diff === 1) {
        return getLabel('tomorrow');
      }
      if (diff === -1) {
        return getLabel('yesterday');
      }
    }

    return getLabel(label, {
      count: Math.abs(diff),
      units: getLabel(unitLabel)
    });
  }
}



/**
 * expects something like "2015-02-23T18:00:00.000Z" or Date
 *
 * unit: atomic unit in milliseconds. Defaults to one day ( h*m*s*ml )
 */

function _diff(dt, unit) {
  let d = new Date(dt), diff;

  if (typeof unit === 'undefined') {
    unit = 24*60*60*1000;
  }

  d = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  return Math.round((d.getTime() - todayDate.getTime()) / unit);
}
