import _ from 'lodash';
import getLocaleValue from '@openagenda/react-shared/lib/utils/getLocaleValue';
import relativeOptions from '../messages/relative';
import attendanceModeOptions from '../messages/attendanceMode';
import provenanceMessages from '../messages/provenance';
import featuredMessages from '../messages/featured';
import stateMessages from '../messages/state';
import statusMessages from '../messages/status';
import dateRanges from './dateRanges';

const AGGREGATION_SIZE = 2000;

export default function withDefaultFilterConfig(filter, intl, opts = {}) {
  const missingValue = opts.missingValue ? 'null' : undefined;

  switch (filter.name) {
    case 'viewport':
      _.defaults(filter, {
        type: 'none'
      });
      break;
    case 'geo':
      _.defaults(filter, {
        type: 'map',
        aggregation: null,
        // props for MapFilter
        tileAttribution:
          '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        tileUrl: opts.mapTiles ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      });
      break;
    case 'addMethod':
      _.defaults(filter, {
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
    case 'memberUid':
      _.defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'member.name',
        aggregation: {
          type: 'members',
          size: AGGREGATION_SIZE,
        },
      });
      break;
    case 'timings':
      _.defaults(filter, {
        type: 'dateRange',
        aggregation: null,
        ...(filter.type === 'definedRange'
          ? dateRanges(intl, {
            staticRanges: filter.staticRanges,
            inputRanges: filter.inputRanges
          })
          : null
        )
      });
      break;
    case 'createdAt':
      _.defaults(filter, {
        type: 'dateRange',
        aggregation: null,
        ...(filter.type === 'definedRange'
          ? dateRanges(intl, {
            staticRanges: filter.staticRanges,
            inputRanges: filter.inputRanges
          })
          : null
        )
      });
      break;
    case 'updatedAt':
      _.defaults(filter, {
        type: 'dateRange',
        aggregation: null,
        ...(filter.type === 'definedRange'
          ? dateRanges(intl, {
            staticRanges: filter.staticRanges,
            inputRanges: filter.inputRanges
          })
          : null
        )
      });
      break;
    case 'state':
      _.defaults(filter, {
        type: 'choice',
        options: [
          {
            label: intl.formatMessage(stateMessages.refused),
            value: -1,
          },
          {
            label: intl.formatMessage(stateMessages.toModerate),
            value: 0,
          },
          {
            label: intl.formatMessage(stateMessages.controlled),
            value: 1,
          },
          {
            label: intl.formatMessage(stateMessages.published),
            value: 2,
          },
        ],
        aggregation: {
          type: 'states'
        }
      });
      break;
    case 'search':
      _.defaults(filter, {
        type: 'search',
        aggregation: null
      });
      break;
    case 'locationUid':
      _.defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'location.name',
        aggregation: {
          type: 'locations',
          size: AGGREGATION_SIZE,
        },
      });
      break;
    case 'sourceAgendaUid':
      _.defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'agenda.title',
        aggregation: {
          type: 'sourceAgendas',
          size: AGGREGATION_SIZE,
        },
      });
      break;
    case 'originAgendaUid':
      _.defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        labelKey: 'agenda.title',
        aggregation: {
          type: 'originAgendas',
          size: AGGREGATION_SIZE,
        },
      });
      break;
    case 'featured':
      _.defaults(filter, {
        type: 'choice',
        options: [
          {
            label: intl.formatMessage(featuredMessages.featured),
            value: true,
          },
        ],
        aggregation: null,
      });
      break;
    case 'relative':
      _.defaults(filter, {
        type: 'choice',
        options: [
          {
            label: intl.formatMessage(relativeOptions.passed),
            value: 'passed'
          },
          {
            label: intl.formatMessage(relativeOptions.current),
            value: 'current'
          },
          {
            label: intl.formatMessage(relativeOptions.upcoming),
            value: 'upcoming'
          }
        ]
      });
      break;
    case 'attendanceMode':
      _.defaults(filter, {
        type: 'choice',
        aggregation: {
          type: 'attendanceModes'
        },
        options: [
          {
            label: intl.formatMessage(attendanceModeOptions.offline),
            value: '1'
          },
          {
            label: intl.formatMessage(attendanceModeOptions.online),
            value: '2'
          },
          {
            label: intl.formatMessage(attendanceModeOptions.mixed),
            value: '3'
          }
        ]
      });
      break;
    case 'region':
      _.defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        missingValue,
        aggregation: {
          type: 'regions',
          size: AGGREGATION_SIZE
        }
      });
      break;
    case 'department':
      _.defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        missingValue,
        aggregation: {
          type: 'departments',
          size: AGGREGATION_SIZE
        }
      });
      break;
    case 'city':
      _.defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        missingValue,
        aggregation: {
          type: 'cities',
          size: AGGREGATION_SIZE
        }
      });
      break;
    case 'adminLevel3':
      _.defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        missingValue,
        aggregation: {
          type: 'adminLevels3',
          size: AGGREGATION_SIZE
        }
      });
      break;
    case 'district':
      _.defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        missingValue,
        aggregation: {
          type: 'districts',
          size: AGGREGATION_SIZE
        }
      });
      break;
    case 'keyword':
      _.defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        aggregation: {
          type: 'keywords',
          size: AGGREGATION_SIZE
        }
      });
      break;
    case 'status':
      _.defaults(filter, {
        type: 'choice',
        options: [
          {
            label: intl.formatMessage(statusMessages.programmed),
            value: 1,
          },
          {
            label: intl.formatMessage(statusMessages.rescheduled),
            value: 2,
          },
          {
            label: intl.formatMessage(statusMessages.movedOnline),
            value: 3,
          },
          {
            label: intl.formatMessage(statusMessages.postponed),
            value: 4,
          },
          {
            label: intl.formatMessage(statusMessages.full),
            value: 5,
          },
          {
            label: intl.formatMessage(statusMessages.cancelled),
            value: 6,
          },
        ],
        aggregation: {
          type: 'status',
        },
      });
      break;
    case 'favorites':
      _.defaults(filter, {
        type: 'favorites',
        aggregation: null
      });
      break;
    default:
      break;
  }

  const { fieldSchema } = filter;

  if (fieldSchema) {
    _.defaults(filter, {
      name: fieldSchema.field,
      type: 'choice',
      fieldSchema,
      options: fieldSchema.options.map(option => ({
        ...option,
        label: getLocaleValue(option.label, intl.locale),
        value: String(option.id)
      })),
      missingValue,
      aggregation: {
        type: 'additionalFields',
        field: fieldSchema.field,
        size: AGGREGATION_SIZE
      }
    });
  }

  return filter;
}
