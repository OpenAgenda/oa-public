const { getLocaleValue } = require('@openagenda/react-shared');
const assignIfEmpty = require('./assignIfEmpty');

const AGGREGATION_SIZE = 2000;

module.exports = function withDefaultFilterConfig(filter, intl) {
  switch (filter.name) {
    case 'geo':
      assignIfEmpty(filter, {
        aggregation: null,
        // props for MapFilter
        tileAttribution:
          '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        tileUrl:
          'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=9f8da49724b645f486f281abbe690750'
      });
      break;
    case 'locationUid':
      assignIfEmpty(filter, {
        //
      });
      break;
    case 'featured':
      assignIfEmpty(filter, {
        //
      });
      break;
    case 'relative':
      assignIfEmpty(filter, {
        options: [
          {
            label: intl.formatMessage({ id: 'passed' }),
            value: 'passed',
          },
          {
            label: intl.formatMessage({ id: 'current' }),
            value: 'current',
          },
          {
            label: intl.formatMessage({ id: 'upcoming' }),
            value: 'upcoming',
          },
        ]
      });
      break;
    case 'attendanceMode':
      assignIfEmpty(filter, {
        aggregation: {
          type: 'attendanceModes'
        },
        options: [
          {
            label: intl.formatMessage({ id: 'offline' }),
            value: '1',
          },
          {
            label: intl.formatMessage({ id: 'online' }),
            value: '2',
          },
          {
            label: intl.formatMessage({ id: 'mixed' }),
            value: '3',
          },
        ]
      });
      break;
    case 'region':
      assignIfEmpty(filter, {
        //
      });
      break;
    case 'department':
      assignIfEmpty(filter, {
        //
      });
      break;
    case 'city':
      assignIfEmpty(filter, {
        //
      });
      break;
    default:
      break;
  }

  const { fieldSchema } = filter;

  if (fieldSchema) {
    assignIfEmpty(filter, {
      name: fieldSchema.field,
      type: fieldSchema.fieldType,
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
};
