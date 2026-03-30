import moment from 'moment-timezone';
import dateRangeInLocale from '@openagenda/date-range';
import addRegistrationType from '@openagenda/utils/registration/addType.js';
import { produce } from 'immer';
import * as aggObjects from './aggregatorObjects.js';
import formatMember from './formatMember.js';
import extractLocationData from './extractLocationData.js';
import cleanTextForSearch from './cleanTextForSearch.js';
import extractSchemaAdditionalSearchables from './extractSchemaAdditionalSearchables.js';
import cleanOptionedFields from './cleanOptionedFields.js';
import toSortTimingFormat from './toSortTimingFormat.js';

const registrationHasType = (registration = []) =>
  !!registration.some((r) => typeof r === 'object' && r?.type);

const multilingualFieldHasValue = (v) => {
  if (!v) {
    return false;
  }
  return Object.keys(v).filter((k) => (v[k] ?? '').length);
};

const dateRange = (timings = [], timezone = 'Europe/Paris', languages = []) =>
  languages.reduce(
    (ranges, lang) => ({
      ...ranges,
      [lang]: dateRangeInLocale(
        timings.map((t) => ({
          start: new Date(t.begin),
          end: new Date(t.end),
        })),
        lang,
        timezone || 'Europe/Paris',
      ),
    }),
    {},
  );

const secondsMidnightDiff = (d, timezone) => {
  const tz = moment(d).tz(timezone || 'Europe/Paris');
  return (
    parseInt(tz.format('HH'), 10) * 60 * 60
    + parseInt(tz.format('mm'), 10) * 60
    + parseInt(tz.format('ss'), 10)
  );
};

const isLessThanOneMinuteApart = (d1, d2) => {
  if (!d1 || !d2) {
    return false;
  }
  return Math.abs(new Date(d1).getTime() - new Date(d2).getTime()) < 60 * 1000;
};

export default (data, options = {}) => {
  const { formSchema = null } = options;

  if (data.removed) {
    return {
      removed: true,
      updatedAt: data.updatedAt,
      uid: data.uid,
      state: -2,
    };
  }

  const cleanedEvent = cleanOptionedFields(data, formSchema);

  return produce(cleanedEvent, (event) => {
    Object.assign(event, {
      removed: false,
      attendanceMode: event.attendanceMode || 1,
      onlineAccessLink: event.onlineAccessLink || null,
      featured: !!event.featured,
      _search_empty_fields: [],
      _search_languages: ['title', 'description', 'longDescription']
        .filter((f) => !!event[f])
        .reduce((languages, field) => {
          if (typeof event[field] === 'string') {
            return languages;
          }
          Object.keys(event[field]).forEach((l) => {
            if (!languages.includes(l)) languages.push(l);
          });
          return languages;
        }, []),
      _search_additional_keywords: [],
      _search_additional_numbers: [],
      _referencing_agenda_uids: event.referencingAgendaUids || [],
    });

    const {
      country,
      location,
      search: locationSearchData,
      emptyFields: emptyLocationFields,
    } = extractLocationData(event.location, { formSchema });

    if (event.location) {
      Object.assign(
        event,
        {
          country,
          location,
        },
        locationSearchData,
      );
    }
    emptyLocationFields.forEach((f) =>
      event._search_empty_fields.push(`location.${f}`));

    if (event.timings) {
      const timezone = event.timezone || (event.location ? event.location.timezone : null);
      const lastTiming = event.timings.reduce(
        (last, timing) => (timing.end > last.end ? timing : last),
        event.timings[0],
      );

      const firstTiming = event.timings.reduce(
        (first, timing) => (timing.begin < first.begin ? timing : first),
        event.timings[0],
      );

      Object.assign(event, {
        dateRange: dateRange(event.timings, timezone, [
          'fr',
          'ar',
          'en',
          'de',
          'es',
          'it',
          'nl',
        ]),
        firstTiming,
        lastTiming,
        _search_last_timing: lastTiming ? new Date(lastTiming.end) : undefined,
        _search_first_timing: firstTiming
          ? new Date(firstTiming.begin)
          : undefined,
        timings: event.timings.map((t) => ({
          ...t,
          _search_begin_from_midnight: secondsMidnightDiff(t.begin, timezone),
        })),
        _sort_timings: event.timings.map((t) => ({
          accessible_until: toSortTimingFormat(t.end),
          begin: toSortTimingFormat(t.begin),
        })),
      });
    }

    if (multilingualFieldHasValue(event.title)) {
      event._search_title = Object.values(data.title);
      event._search_title_filtered = cleanTextForSearch(data.title);
    } else {
      event._search_empty_fields.push('title');
    }

    if (multilingualFieldHasValue(event.description)) {
      event._search_description = Object.values(data.description);
      event._search_description_filtered = cleanTextForSearch(data.description);
    } else {
      event._search_empty_fields.push('description');
    }

    event._search_keywords = [];

    if (Object.keys(event.accessibility ?? {}).length) {
      Object.keys(event.accessibility ?? {})
        .filter((a) => !!event.accessibility[a])
        .map((a) => `accessibility.${a}`)
        .forEach((key) => event._search_keywords.push(key));
    }

    if (multilingualFieldHasValue(event.keywords)) {
      event._search_keywords = event._search_keywords.concat(
        Object.values(event.keywords),
      );
      event._search_keywords_text = Object.values(event.keywords);
    } else {
      event._search_empty_fields.push('keywords');
    }

    if (event.originAgenda) {
      event.originAgenda._agg = aggObjects.flatten(event.originAgenda, [
        'uid',
        'title',
        'image',
        'url',
        'slug',
      ]);
      event.originAgenda.official = !!event.originAgenda.official;
    }
    if (event.sourceAgendas) {
      event.sourceAgendas.forEach((sourceAgenda) => {
        sourceAgenda._agg = aggObjects.flatten(sourceAgenda, [
          'uid',
          'title',
          'image',
        ]);
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

    if (event.valid === undefined) {
      event._search_empty_fields.push('valid');
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

    emptyFields.forEach((f) => {
      event._search_empty_fields.push(f);
    });

    emptyListFields.forEach((f) => {
      event[f.field] = [];
    });

    searchableKeywords.forEach((k) =>
      event._search_additional_keywords.push(k));
    searchableNumbers.forEach((k) => event._search_additional_numbers.push(k));

    return event;
  });
};
