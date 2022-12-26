'use strict';

const moment = require('moment-timezone');
const dateRangeInLocale = require('@openagenda/date-range');
const addRegistrationType = require('@openagenda/utils/registration/addType');
const { produce } = require('immer');

const aggObjects = require('./aggregatorObjects');
const formatMember = require('./formatMember');
const extractLocationData = require('./extractLocationData');
const extractSchemaAdditionalSearchables = require('./extractSchemaAdditionalSearchables');

const registrationHasType = (registration = []) => !!registration.some(r => typeof r === 'object' && r?.type);

const multilingualFieldHasValue = v => {
  if (!v) {
    return false;
  }
  return Object.keys(v).filter(k => (v[k] ?? '').length);
};

const dateRange = (timings = [], timezone = 'Europe/Paris', languages = []) => languages
  .reduce((ranges, lang) => ({
    ...ranges,
    [lang]: dateRangeInLocale(timings.map(t => ({
      start: new Date(t.begin),
      end: new Date(t.end),
    })), lang, timezone || 'Europe/Paris'),
  }), {});

const secondsMidnightDiff = (d, timezone) => {
  const tz = moment(d).tz(timezone || 'Europe/Paris');
  return parseInt(tz.format('HH'), 10) * 60 * 60 + parseInt(tz.format('mm'), 10) * 60 + parseInt(tz.format('ss'), 10);
};

const isLessThanOneMinuteApart = (d1, d2) => {
  if (!d1 || !d2) {
    return false;
  }
  return Math.abs(new Date(d1).getTime() - new Date(d2).getTime()) < 60 * 1000;
};

module.exports = produce((event, options = {}) => {
  const {
    formSchema = null,
    locationFormSchema,
    endOfTimes = '3000-01-01T01:00:00.000Z',
  } = options;

  Object.assign(event, {
    attendanceMode: event.attendanceMode || 1,
    onlineAccessLink: event.onlineAccessLink || null,
    featured: !!event.featured,
    _search_empty_fields: [],
    _search_languages: ['title', 'description', 'longDescription']
      .filter(f => !!event[f])
      .reduce((languages, field) => {
        Object.keys(event[field]).forEach(l => {
          if (!languages.includes(l)) languages.push(l);
        });
        return languages;
      }, []),
  });

  const {
    country,
    location,
    search: locationSearchData,
    emptyFields: emptyLocationFields,
  } = extractLocationData(event.location, { formSchema: locationFormSchema });

  if (event.location) {
    Object.assign(event, {
      country,
      location,
    }, locationSearchData);
  }

  emptyLocationFields.forEach(locationField => {
    event._search_empty_fields.push(`location.${locationField}`);
  });

  if (event.timings) {
    const timezone = event.timezone || (event.location ? event.location.timezone : null);
    Object.assign(event, {
      dateRange: dateRange(event.timings, timezone, ['fr', 'ar', 'en', 'de', 'es', 'it']),
      _search_last_timing: new Date(event.timings.reduce(
        (last, timing) => (timing.end > last ? timing.end : last),
        event.timings[0].end,
      )),
      _search_first_timing: new Date(event.timings.reduce(
        (first, timing) => (timing.begin < first ? timing.begin : first),
        event.timings[0].begin,
      )),
      timings: event.timings.map(t => ({
        ...t,
        _search_begin_from_midnight: secondsMidnightDiff(t.begin, timezone),
      })),
      _search_timings: event.timings.map(t => ({
        accessible_until: t.end,
        begin: t.begin,
      })).concat({
        // this bit is important for search_after.
        // End of times need to be a manageable date
        accessible_until: endOfTimes,
        begin: endOfTimes,
      }),
    });
  }

  if (multilingualFieldHasValue(event.title)) {
    event._search_title = Object.values(event.title);
  } else {
    event._search_empty_fields.push('title');
  }

  if (multilingualFieldHasValue(event.description)) {
    event._search_description = Object.values(event.description);
  } else {
    event._search_empty_fields.push('description');
  }

  event._search_keywords = [];

  if (Object.keys(event.accessibility ?? {}).length) {
    Object.keys(event.accessibility ?? {})
      .filter(a => !!event.accessibility[a])
      .map(a => `accessibility.${a}`)
      .forEach(key => event._search_keywords.push(key));
  }

  if (multilingualFieldHasValue(event.keywords)) {
    event._search_keywords = event._search_keywords.concat(Object.values(event.keywords));
    event._search_keywords_text = Object.values(event.keywords);
  } else {
    event._search_empty_fields.push('keywords');
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
    event.member = formatMember(event);
  } else {
    event._search_empty_fields.push('member');
  }

  if (event.registration && !registrationHasType(event.registration)) {
    event.registration = addRegistrationType(event.registration, {
      filterUnknown: true,
    });
  } else {
    event._search_empty_fields.push('registration');
  }

  if (!isLessThanOneMinuteApart(event.updatedAt, event.createdAt)) {
    event._exclusiveUpdatedAt = event.updatedAt;
  }

  if (!formSchema) {
    return event;
  }

  const {
    searchableKeywords,
    emptyListFields,
    emptyFields,
    searchableNumbers,
  } = extractSchemaAdditionalSearchables(formSchema, event);

  emptyFields.forEach(f => {
    event._search_empty_fields.push(f.field);
  });

  emptyListFields.forEach(f => {
    event[f.field] = [];
  });

  Object.assign(event, {
    _search_additional_keywords: searchableKeywords,
    _search_additional_numbers: searchableNumbers,
  });

  return event;
});
