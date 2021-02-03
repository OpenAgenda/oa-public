"use strict";

const schema = require('@openagenda/validators/schema');

const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');
const preCleanRawQuery = require('./preCleanRawQuery');

schema.register({
  text: require('@openagenda/validators/text'),
  integer: require('@openagenda/validators/integer'),
  latitude: require('@openagenda/validators/latitude'),
  longitude: require('@openagenda/validators/longitude'),
  date: require('@openagenda/validators/date'),
  choice: require('@openagenda/validators/choice'),
  boolean: require('@openagenda/validators/boolean')
});

const validate = schema({
  uid: {
    type: 'integer',
    list: true
  },
  slug: {
    type: 'text',
    list: true
  },
  search: {
    type: 'text'
  },
  set: {
    type: 'text'
  },
  keyword: {
    type: 'text',
    list: true
  },
  lang: {
    type: 'text',
    list: true
  },
  locationUid: {
    type: 'integer',
    list: true
  },
  region: {
    type: 'text',
    list: true
  },
  department: {
    type: 'text',
    list: true
  },
  city: {
    type: 'text',
    list: true
  },
  countryCode: {
    type: 'text',
    min: 0,
    max: 2,
    list: true
  },
  memberUid: {
    type: 'integer',
    list: true
  },
  originAgendaUid: {
    type: 'integer',
    list: true
  },
  sourceAgendaUid: {
    type: 'integer',
    list: true
  },
  state: {
    optional: true,
    type: 'choice',
    options: [null, -1, 0, 1, 2],
    default: 2
  },
  geo: {
    fields: {
      northEast: {
        optional: false,
        fields: {
          lat: {
            type: 'latitude'
          },
          lng: {
            type: 'longitude'
          }
        }
      },
      southWest: {
        optional: false,
        fields: {
          lat: {
            type: 'latitude'
          },
          lng: {
            type: 'longitude'
          }
        }
      }
    }
  },
  localTime: {
    fields: {
      gte: {
        type: 'integer'
      },
      lte: {
        type: 'integer'
      }
    }
  },
  createdAt: {
    fields: {
      gte: {
        type: 'date'
      },
      lte: {
        type: 'date'
      }
    }
  },
  updatedAt: {
    fields: {
      gte: {
        type: 'date'
      },
      lte: {
        type: 'date'
      }
    }
  },
  timings: {
    fields: {
      gte: {
        type: 'date'
      },
      lte: {
        type: 'date'
      }
    }
  },
  sort: {
    type: 'choice',
    options: [
      'updatedAt.desc',
      'updatedAt.asc',
      'location.name.asc',
      'location.city.asc',
      'location.name.desc',
      'location.city.desc',
      'score'
    ],
    optional: true,
    unique: false
  }
});

function cleanAdditionalField(fieldSchema, dirty) {
  if (['radio', 'checkbox'].includes(fieldSchema.fieldType)) {
    if (Array.isArray(dirty)) {
      return dirty.map(v => parseInt(v, 10));
    } else {
      return parseInt(dirty, 10);
    }
  }

  return dirty;
}

module.exports = function validateQuery(dirty, formSchema) {
  const preCleaned = preCleanRawQuery(dirty);

  const clean = validate(preCleaned);

  const additionalFields = getFormSchemaAdditionalFields(formSchema);

  return {
    ...clean,
    ...additionalFields.reduce((additionalValues, fieldSchema) => {
      const { field } = fieldSchema;
      const value = dirty[field] !== undefined
        ? dirty[field]
        : dirty.custom && dirty.custom[field] !== undefined
          ? dirty.custom[field]
          : undefined;

      if (value !== undefined) {
        const cleanValue = cleanAdditionalField(fieldSchema, value);

        return {
          ...additionalValues,
          [field]: cleanValue
        };
      }

      return additionalValues;
    }, {})
  };
}
