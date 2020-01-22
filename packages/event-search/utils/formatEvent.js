'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const moment = require('moment-timezone');
const countries = require('@openagenda/labels/agenda-locations/countries');
const dateRange = require('@openagenda/date-range');

const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');

module.exports = (event, formSchema = null) => {
  const transform = {};

  if (event.location) {
    const country = _.get(countries,
      (_.get(event, 'location.countryCode') || '').toUpperCase()
    , {});
    transform.country = {
      $set: country
    };
    transform['_search_full_address_text'] = {
      $set: _searchFullAddressText(event.location, country)
    };
    transform['_search_location'] = {
      $set: {
        lat: event.location.latitude,
        lon: event.location.longitude
      }
    };
  }

  if (event.timings) {
    const timezone = event.timezone || (event.location ? event.location.timezone : null);
    transform.dateRange = {
      $set: _dateRange(event.timings, timezone, ['fr', 'ar', 'en', 'de', 'es'])
    }
    transform['_search_last_timing'] = {
      $set: new Date(event.timings.reduce(
        (last, timing) => timing.end > last ? timing.end : last,
        event.timings[0].end
      ))
    };
    transform.timings = {
      $set: event.timings.map(t => ({
        ...t,
        '_search_begin_from_midnight': _secondsMidnightDiff(t.begin, timezone)
      }))
    };
  }

  if (event.title) {
    transform['_search_title'] = {
      $set: Object.values(event.title)
    };
  }
  if (event.description) {
    transform['_search_description'] = {
      $set: Object.values(event.description)
    };
  }
  if (event.keywords) {
    transform['_search_keywords'] = {
      $set: Object.values(event.keywords)
    };
    transform['_search_keywords_text'] = {
      $set: Object.values(event.keywords)
    };
  }
  if (event.originAgenda) {
    transform['_search_agenda'] = {
      $set: ['uid', 'title', 'image']
        .map(field => [field, event.originAgenda[field]].join(':'))
        .join('|')
    };
  }
  if (event.member) {
    transform.member = {
      $set: {
        uid: _.get(event, 'member.userUid', null),
        name: _.get(event, 'member.custom.contactName', null)
      }
    };
  }

  transform['_search_languages'] = {
    $set: ['title', 'description','longDescription']
      .filter(f => !!event[f])
      .reduce((languages, field) => {
        Object.keys(event[field]).forEach(l => {
          if (!languages.includes(l)) languages.push(l);
        })
        return languages;
      }, [])
  };

  if (formSchema) {
    transform['_search_additional_keywords'] = {
      $set: getFormSchemaAdditionalFields(formSchema)
        .map(field => ({
          field,
          value: event[field.field]
        }))
        .filter(({ field, value }) => (
          ![undefined, null].includes(value) // there is a value
        ) && (
          ['email', 'radio', 'checkbox'].includes(field.fieldType)
        ))
        .reduce((keywords, { field, value }) => {
          return keywords.concat(['radio', 'checkbox'].includes(field.fieldType)
            ? [].concat(value).map(v => [field.schemaId, v].join('.')) : value)
        }, [])
      };
  }

  return ih(event, transform);
}

function _secondsMidnightDiff(d, timezone = 'Europe/Paris') {
  const tz = moment(d).tz(timezone);
  return parseInt(tz.format('HH')) * 60 * 60 + parseInt(tz.format('mm')) * 60 + parseInt(tz.format('ss'));
}

function _dateRange(timings = [], timezone = 'Europe/Paris', languages = []) {
  return languages.reduce((ranges, lang) => ({
    ...ranges,
    [lang]: dateRange(timings.map(t => ({
      start: new Date(t.begin),
      end: new Date(t.end)
    })), lang, timezone)
  }), {});
}

function _searchFullAddressText(location, country) {
  return ['address', 'city', 'region', 'department']
    .map(f => location[f])
    .filter(f => !!f)
    .concat(Object.values(country))
    .join(' ');
}
