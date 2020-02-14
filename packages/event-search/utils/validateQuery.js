"use strict";

const schema = require('@openagenda/validators/schema');

const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');

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
  state: {
    optional: true,
    type: 'choice',
    unique: true,
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
  date: {
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
    unique: false,
    default: null
  }
});

module.exports = (dirty, formSchema) => {
  const clean = validate(dirty);

  const additionalFields = getFormSchemaAdditionalFields(formSchema)
    .map(f => f.field);

  const c = {
    ...clean,
    ...additionalFields.reduce((additionalValues, field) => {
      if (dirty[field] !== undefined) {
        return {
          ...additionalValues,
          [field]: dirty[field]
        };
      }
      if (dirty.custom && dirty.custom[field] !== undefined) {
        return {
          ...additionalValues,
          [field]: dirty.custom[field]
        };
      }
      return additionalValues;
    }, {})
  };

  return c;
}
