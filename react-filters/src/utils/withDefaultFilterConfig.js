import defaults from 'lodash/defaults.js';
import { getLocaleValue } from '@openagenda/intl';
import relativeOptions from '../messages/relative.js';
import attendanceModeOptions from '../messages/attendanceMode.js';
import provenanceMessages from '../messages/provenance.js';
import featuredMessages from '../messages/featured.js';
import stateMessages from '../messages/state.js';
import statusMessages from '../messages/status.js';
import booleanMessages from '../messages/boolean.js';
import accessibilitiesMessages from '../messages/accessibilities.js';
import dateRanges from './dateRanges.js';

function assignDateRanges(filter, intl, dataFnsLocale) {
  if (filter.type === 'definedRange') {
    Object.assign(
      filter,
      dateRanges(intl, {
        dataFnsLocale,
        staticRanges: filter.staticRanges,
        inputRanges: filter.inputRanges,
      }),
    );
  }
}

export default function withDefaultFilterConfig(filter, intl, opts = {}) {
  const { missingValue, dataFnsLocale } = opts;

  switch (filter.name) {
    case 'viewport':
      defaults(filter, {
        type: 'none',
      });
      break;
    case 'geo':
      defaults(filter, {
        type: 'map',
        aggregation: null,
        // props for MapFilter
        tileAttribution:
          '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        tileUrl:
          opts.mapTiles ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      });
      break;
    case 'addMethod':
      defaults(filter, {
        type: 'choice',
        options: [
          {
            label: intl.formatMessage(provenanceMessages.contribution),
            value: 'contribution',
          },
          {
            label: intl.formatMessage(provenanceMessages.aggregation),
            value: 'aggregation',
          },
          {
            label: intl.formatMessage(provenanceMessages.share),
            value: 'share',
          },
        ],
        aggregation: {
          type: 'addMethods',
        },
      });
      break;
    case 'accessibility':
      defaults(filter, {
        type: 'choice',
        options: [
          {
            label: intl.formatMessage(accessibilitiesMessages.hi),
            value: 'hi',
          },
          {
            label: intl.formatMessage(accessibilitiesMessages.vi),
            value: 'vi',
          },
          {
            label: intl.formatMessage(accessibilitiesMessages.pi),
            value: 'pi',
          },
          {
            label: intl.formatMessage(accessibilitiesMessages.mi),
            value: 'mi',
          },
          {
            label: intl.formatMessage(accessibilitiesMessages.ii),
            value: 'ii',
          },
        ],
        aggregation: {
          type: 'accessibilities',
        },
      });
      break;
    case 'languages':
      defaults(filter, {
        type: 'choice',
        options: null,
      });
      break;
    case 'memberUid':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'member.name',
        aggregation: {
          type: 'members',
        },
      });
      break;
    case 'timings':
      defaults(filter, {
        type: 'dateRange',
        aggregation: null,
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case 'createdAt':
      defaults(filter, {
        type: 'dateRange',
        aggregation: null,
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case 'updatedAt':
      defaults(filter, {
        type: 'dateRange',
        aggregation: null,
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case 'state':
      defaults(filter, {
        type: 'choice',
        options: [
          {
            label: intl.formatMessage(stateMessages.refused),
            value: '-1',
          },
          {
            label: intl.formatMessage(stateMessages.toModerate),
            value: '0',
          },
          {
            label: intl.formatMessage(stateMessages.controlled),
            value: '1',
          },
          {
            label: intl.formatMessage(stateMessages.published),
            value: '2',
          },
        ],
        aggregation: {
          type: 'states',
        },
      });
      break;
    case 'search':
      defaults(filter, {
        type: 'search',
        aggregation: null,
      });
      break;
    case 'locationUid':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'location.name',
        aggregation: {
          type: 'locations',
        },
      });
      break;
    case 'sourceAgendaUid':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'agenda.title',
        aggregation: {
          type: 'sourceAgendas',
        },
      });
      break;
    case 'originAgendaUid':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'agenda.title',
        aggregation: {
          type: 'originAgendas',
        },
      });
      break;
    case 'featured':
      defaults(filter, {
        type: 'choice',
        options: [
          {
            label: intl.formatMessage(featuredMessages.featured),
            value: 'true',
          },
        ],
        aggregation: null,
      });
      break;
    case 'relative':
      defaults(filter, {
        type: 'choice',
        options: [
          {
            label: intl.formatMessage(relativeOptions.passed),
            value: 'passed',
          },
          {
            label: intl.formatMessage(relativeOptions.current),
            value: 'current',
          },
          {
            label: intl.formatMessage(relativeOptions.upcoming),
            value: 'upcoming',
          },
        ],
      });
      break;
    case 'attendanceMode':
      defaults(filter, {
        type: 'choice',
        aggregation: {
          type: 'attendanceModes',
        },
        options: [
          {
            label: intl.formatMessage(attendanceModeOptions.offline),
            value: '1',
          },
          {
            label: intl.formatMessage(attendanceModeOptions.online),
            value: '2',
          },
          {
            label: intl.formatMessage(attendanceModeOptions.mixed),
            value: '3',
          },
        ],
      });
      break;
    case 'region':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        missingValue,
        aggregation: {
          type: 'regions',
        },
      });
      break;
    case 'department':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        missingValue,
        aggregation: {
          type: 'departments',
        },
      });
      break;
    case 'city':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        missingValue,
        aggregation: {
          type: 'cities',
        },
      });
      break;
    case 'countryCode':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        missingValue,
        aggregation: {
          type: 'countryCodes',
        },
      });
      break;
    case 'adminLevel3':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        missingValue,
        aggregation: {
          type: 'adminLevels3',
        },
      });
      break;
    case 'district':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        missingValue,
        aggregation: {
          type: 'districts',
        },
      });
      break;
    case 'keyword':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        aggregation: {
          type: 'keywords',
        },
      });
      break;
    case 'status':
      defaults(filter, {
        type: 'choice',
        options: [
          {
            label: intl.formatMessage(statusMessages.programmed),
            value: '1',
          },
          {
            label: intl.formatMessage(statusMessages.rescheduled),
            value: '2',
          },
          {
            label: intl.formatMessage(statusMessages.movedOnline),
            value: '3',
          },
          {
            label: intl.formatMessage(statusMessages.postponed),
            value: '4',
          },
          {
            label: intl.formatMessage(statusMessages.full),
            value: '5',
          },
          {
            label: intl.formatMessage(statusMessages.cancelled),
            value: '6',
          },
        ],
        aggregation: {
          type: 'status',
        },
      });
      break;
    case 'favorites':
      defaults(filter, {
        type: 'favorites',
        aggregation: null,
      });
      break;
    default:
      break;
  }

  const { fieldSchema } = filter;

  // additional boolean field
  if (fieldSchema?.fieldType === 'boolean') {
    defaults(filter, {
      name: fieldSchema.field,
      type: 'choice',
      fieldSchema,
      options: [
        {
          label: intl.formatMessage(booleanMessages.selected),
          value: 'true',
        },
        {
          label: intl.formatMessage(booleanMessages.notSelected),
          value: 'false',
        },
      ],
      missingValue,
      aggregation: {
        type: 'additionalFields',
        field: fieldSchema.field,
      },
    });

    // additional number field
  } else if (['number', 'integer'].includes(fieldSchema?.fieldType)) {
    defaults(filter, {
      type: 'numberRange',
      name: fieldSchema.field,
      fieldSchema,
      aggregation: null,
    });

    // additional optioned field
  } else if (fieldSchema) {
    defaults(filter, {
      name: fieldSchema.field,
      type: 'choice',
      fieldSchema,
      options: !filter.aggregationOnly
        ? fieldSchema.options.map((option) => ({
          ...option,
          label: getLocaleValue(option.label, intl.locale),
          value: String(option.id),
        }))
        : null,
      missingValue,
      aggregation: {
        type: 'additionalFields',
        field: fieldSchema.field,
      },
      labelKey: 'label',
    });
  }

  return filter;
}
