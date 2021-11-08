import _ from 'lodash';
import getLocaleValue from '@openagenda/react-shared/lib/utils/getLocaleValue';
import relativeOptions from '../messages/relativeOptions';
import attendanceModeOptions from '../messages/attendanceModeOptions';
import dateRanges from './dateRanges';

const AGGREGATION_SIZE = 2000;

const defaults = _.partialRight(
  _.assignWith,
  (objValue, srcValue) => (_.isUndefined(objValue) ? srcValue : objValue)
);

export default function withDefaultFilterConfig(filter, intl) {
  switch (filter.name) {
    case 'geo':
      defaults(filter, {
        type: 'map',
        aggregation: null,
        // props for MapFilter
        tileAttribution:
          '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      });
      break;
    case 'timings':
      defaults(filter, {
        type: 'dateRange',
        aggregation: null
      });
      if (filter.type === 'definedRange') {
        Object.assign(filter, dateRanges(intl, filter));
      }
      break;
    case 'search':
      defaults(filter, {
        type: 'search',
        aggregation: null
      });
      break;
    case 'locationUid':
      defaults(filter, {
        //
      });
      break;
    case 'featured':
      defaults(filter, {
        //
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
        ]
      });
      break;
    case 'attendanceMode':
      defaults(filter, {
        type: 'choice',
        aggregation: {
          type: 'attendanceModes'
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
        ]
      });
      break;
    case 'region':
      defaults(filter, {
        //
      });
      break;
    case 'department':
      defaults(filter, {
        //
      });
      break;
    case 'city':
      defaults(filter, {
        type: 'choice',
        options: null, // from the aggregation
        aggregation: {
          type: 'cities',
          size: AGGREGATION_SIZE,
        }
      });
      break;
    default:
      break;
  }

  const { fieldSchema } = filter;

  if (fieldSchema) {
    defaults(filter, {
      name: fieldSchema.field,
      type: 'choice',
      fieldSchema,
      options: fieldSchema.options.map(option => ({
        ...option,
        label: getLocaleValue(option.label, intl.locale),
        value: String(option.id),
      })),
      aggregation: {
        type: 'additionalFields',
        field: fieldSchema.field,
        size: AGGREGATION_SIZE,
      }
    });
  }

  return filter;
}
