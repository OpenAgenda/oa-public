'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('formatEvent');
const moment = require('moment-timezone');
const countries = require('@openagenda/labels/agenda-locations/countries');
const dateRange = require('@openagenda/date-range');
const addRegistrationType = require('@openagenda/utils/registration/addType');

const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');
const aggObjects = require('./aggregatorObjects');
const { produce } = require('immer');

const registrationHasType = (registration = []) => !!registration.some(r => typeof r === 'object' && r.type);

module.exports = produce((event, options = {}) => {
  const {
    formSchema = null
  } = options;

  Object.assign(event, {
    attendanceMode: event.attendanceMode || 1,
    onlineAccessLink: event.onlineAccessLink || null,
    featured: !!event.featured,
    '_search_languages': ['title', 'description','longDescription']
      .filter(f => !!event[f])
      .reduce((languages, field) => {
        Object.keys(event[field]).forEach(l => {
          if (!languages.includes(l)) languages.push(l);
        });
        return languages;
      }, [])
  });

  if (event.location) {
    const country = _.omit(
      _clearEmptyLabels(_.get(countries,
        (_.get(event, 'location.countryCode') || '').toUpperCase()
      , {})),
      ['io']
    );

    Object.assign(event, {
      country,
      '_search_full_address_text': _searchFullAddressText(event.location, country),
      '_search_location': {
        lat: event.location.latitude,
        lon: event.location.longitude
      }
    });

    event.location._agg = aggObjects.flatten(event.location, ['uid', 'name']);
  }

  if (event.timings) {
    const timezone = event.timezone || (event.location ? event.location.timezone : null);
    Object.assign(event, {
      dateRange: _dateRange(event.timings, timezone, ['fr', 'ar', 'en', 'de', 'es']),
      '_search_last_timing': new Date(event.timings.reduce(
        (last, timing) => timing.end > last ? timing.end : last,
        event.timings[0].end
      )),
      '_search_first_timing': new Date(event.timings.reduce(
        (first, timing) => timing.begin < first ? timing.begin : first,
        event.timings[0].begin
      )),
      timings: event.timings.map(t => ({
        ...t,
        '_search_begin_from_midnight': _secondsMidnightDiff(t.begin, timezone)
      })),
      '_search_timings': event.timings.map(t => ({
        accessible_until: t.begin
      })).concat({
        // this bit is important for search_after.
        // End of times need to be a manageable date
        accessible_until: '3000-01-01T01:00:00.000Z'
      })
    });
  }

  if (event.title) {
    event['_search_title'] = Object.values(event.title);
  }
  if (event.description) {
    event['_search_description'] = Object.values(event.description);
  }
  if (event.keywords) {
    event['_search_keywords'] = Object.values(event.keywords);
    event['_search_keywords_text'] = Object.values(event.keywords);
  }

  if (event.originAgenda) {
    event.originAgenda._agg = aggObjects.flatten(event.originAgenda, ['uid', 'title', 'image', 'url', 'slug']);
  }
  if (event.sourceAgendas) {
    event.sourceAgendas.forEach(sourceAgenda => {
      sourceAgenda._agg = aggObjects.flatten(sourceAgenda, ['uid', 'title', 'image']);
    });
  }

  if (event.member) {
    event.member = {
      uid: event.member?.userUid ?? null,
      name: event.member?.custom?.contactName ?? null,
      role: event.member?.role ?? null,
      organization: event.member?.custom?.organization ?? null,
      position: event.member?.custom?.contactPosition ?? null,
      phone: event.member?.custom?.contactNumber ?? null,
      email: event.member?.custom?.email ?? null
    };

    event.member._agg = aggObjects.flatten(event.member, ['uid', 'name']);
  }

  if (event.registration && !registrationHasType(event.registration)) {
    event.registration = addRegistrationType(event.registration, {
      filterUnknown: true
    });
  }

  if (!_lessThanOneMinuteApart(event.updatedAt, event.createdAt)) {
    event['_exclusiveUpdatedAt'] = event.updatedAt;
  }

  if (!formSchema) {
    return event;
  }

  const schemaAdditionalFields = getFormSchemaAdditionalFields(formSchema);

  schemaAdditionalFields.forEach(additionalField => {
    if (event[additionalField.field] === undefined) {
      event[additionalField.field] = ['radio', 'select'].includes(additionalField.fieldType) ? [] : null
    }
  });

  event['_search_additional_keywords'] = schemaAdditionalFields
    .map(field => ({
      field,
      value: event[field.field]
    }))
    .filter(({ value, field }) => (
      ![undefined, null].includes(value) // there is a value
    ) && (
      ['email', 'radio', 'select', 'checkbox', 'multiselect'].includes(field.fieldType)
    ))
    .reduce((keywords, { field, value }) => {
      return keywords.concat(['radio', 'checkbox', 'select', 'multiselect'].includes(field.fieldType)
        ? [].concat(value).map(v => [field.schemaId, v].join('.')) : value)
    }, []);

  event['_search_additional_numbers'] = schemaAdditionalFields
    .map(field => ({
      field,
      value: event[field.field]
    }))
    .filter(({ value, field }) => (
      ![undefined, null].includes(value) // there is a value
    ) && (
      ['number', 'integer'].includes(field.fieldType)
    ))
    .reduce((nested, { field, value }) => nested.concat({
      fieldName: field.field,
      integer: parseInt(value, 10),
      number: parseFloat(value)
    }), [])
    // ES integers cannot exceed 2^31-1
    .filter(({ integer }) => integer < 2147483648);
});

function _secondsMidnightDiff(d, timezone) {
  const tz = moment(d).tz(timezone || 'Europe/Paris');
  return parseInt(tz.format('HH')) * 60 * 60 + parseInt(tz.format('mm')) * 60 + parseInt(tz.format('ss'));
}

function _dateRange(timings = [], timezone, languages = []) {
  return languages.reduce((ranges, lang) => ({
    ...ranges,
    [lang]: dateRange(timings.map(t => ({
      start: new Date(t.begin),
      end: new Date(t.end)
    })), lang, timezone || 'Europe/Paris')
  }), {});
}

function _searchFullAddressText(location, country) {
  return ['address', 'city', 'region', 'department', 'name', 'adminLevel3', 'adminLevel5']
    .map(f => location[f])
    .filter(f => !!f)
    .concat(Object.values(country))
    .join(' ');
}

function _clearEmptyLabels(labels) {
  return Object.keys(labels)
    .filter(lang => labels[lang].length)
    .reduce((filtered, lang) => ({
      ...filtered,
      [lang]: labels[lang]
    }), {});
}

function _lessThanOneMinuteApart(d1, d2) {
  if (!d1 || !d2) {
    return false;
  }
  return Math.abs((new Date(d1)).getTime() - (new Date(d2)).getTime()) < 60*1000;
}
