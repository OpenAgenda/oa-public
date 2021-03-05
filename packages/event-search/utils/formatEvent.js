'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const moment = require('moment-timezone');
const countries = require('@openagenda/labels/agenda-locations/countries');
const dateRange = require('@openagenda/date-range');
const addRegistrationType = require('@openagenda/utils/registration/addType');

const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');
const aggObjects = require('./aggregatorObjects');

module.exports = (event, formSchema = null) => {
  const transform = {
    $unset: []
  };

  if (event.location) {
    const country = _clearEmptyLabels(_.get(countries,
      (_.get(event, 'location.countryCode') || '').toUpperCase()
    , {}));
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
    transform['_search_timings'] = {
      $set: event.timings.map(t => ({
        accessible_until: t.begin
      })).concat({
        // this bit is important for search_after.
        // End of times need to be a manageable date
        accessible_until: '3000-01-01T01:00:00.000Z'
      })
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
    transform.originAgenda = {
      _agg: {
        $set: aggObjects.flatten(event.originAgenda, ['uid', 'title', 'image'])
      }
    }
  }
  if (event.sourceAgendas) {
    transform.sourceAgendas = event.sourceAgendas.reduce((transform, sourceAgenda, index) => ({
      [index]: {
        _agg: {
          $set: aggObjects.flatten(sourceAgenda, ['uid', 'title', 'image'])
        }
      }
    }), {});
  }
  if (event.member) {
    const member = {
      uid: _.get(event, 'member.userUid', null),
      name: _.get(event, 'member.custom.contactName', null)
    };
    transform.member = {
      $set: {
        ...member,
        _agg: aggObjects.flatten(member, ['uid', 'name'])
      }
    };
  }

  if (event.registration) {
    transform.registration = {
      $set: addRegistrationType(event.registration, {
        filterUnknown: true
      })
    }
  }

  transform.attendanceMode = {
    $set: event.attendanceMode || 1
  };

  transform.onlineAccessLink = {
    $set: event.onlineAccessLink || null
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

  if (!_lessThanOneMinuteApart(event.updatedAt, event.createdAt)) {
    transform['_exclusiveUpdatedAt'] = {
      $set: event.updatedAt
    };
  }

  if (formSchema) {
    const schemaAdditionalFields = getFormSchemaAdditionalFields(formSchema);

    schemaAdditionalFields.forEach(additionalField => {
      if (event[additionalField.field] === undefined) {
        transform[additionalField.field] = {
          $set: additionalField.fieldType === 'radio' ? [] : null
        }
      }
    });

    transform['_search_additional_keywords'] = {
      $set: schemaAdditionalFields
        .map(field => ({
          field,
          value: event[field.field]
        }))
        .filter(({ value, field }) => (
          ![undefined, null].includes(value) // there is a value
        ) && (
          ['email', 'radio', 'checkbox'].includes(field.fieldType)
        ))
        .reduce((keywords, { field, value }) => {
          return keywords.concat(['radio', 'checkbox'].includes(field.fieldType)
            ? [].concat(value).map(v => [field.schemaId, v].join('.')) : value)
        }, [])
      };

    transform['_search_additional_numbers'] = {
      $set: schemaAdditionalFields
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
        .filter(({ integer }) => integer < 2147483648)
      };
  }

  return ih(event, transform);
}

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
  return ['address', 'city', 'region', 'department']
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
