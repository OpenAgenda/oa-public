'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');

const textValidator = require('@openagenda/validators/text');
const integerValidator = require('@openagenda/validators/integer');
const latitudeValidator = require('@openagenda/validators/latitude');
const longitudeValidator = require('@openagenda/validators/longitude');
const dateValidator = require('@openagenda/validators/date');
const choiceValidator = require('@openagenda/validators/choice');
const booleanValidator = require('@openagenda/validators/boolean');

const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');
const preCleanRawQuery = require('./preCleanRawQuery');
const derelativize = require('./derelativize');

schema.register({
  text: textValidator,
  integer: integerValidator,
  latitude: latitudeValidator,
  longitude: longitudeValidator,
  date: dateValidator,
  choice: choiceValidator,
  boolean: booleanValidator,
});

const validate = schema({
  uid: {
    type: 'integer',
    list: true,
  },
  slug: {
    type: 'text',
    list: true,
    emptyStringAsUndefined: false,
    min: 1,
  },
  search: {
    type: 'text',
  },
  set: {
    type: 'text',
  },
  keyword: {
    type: 'text',
    list: true,
  },
  accessibility: {
    type: 'text',
    min: 2,
    max: 2,
    list: true,
  },
  languages: {
    type: 'text',
    list: true,
  },
  locationUid: {
    type: 'integer',
    list: true,
  },
  ownerUid: {
    type: 'integer',
    list: true,
  },
  memberUid: {
    type: 'integer',
    list: true,
  },
  ownerOrMemberUid: {
    type: 'integer',
    list: true,
  },
  region: {
    type: 'text',
    list: true,
  },
  adminLevel3: {
    type: 'text',
    list: true,
  },
  adminLevel5: {
    type: 'text',
    list: true,
  },
  department: {
    type: 'text',
    list: true,
  },
  relative: {
    type: 'choice',
    options: ['passed', 'upcoming', 'current'],
  },
  addMethod: {
    type: 'choice',
    options: ['contribution', 'share', 'aggregation'],
  },
  city: {
    type: 'text',
    list: true,
  },
  district: {
    type: 'text',
    list: true,
  },
  countryCode: {
    type: 'text',
    min: 0,
    max: 2,
    list: true,
  },
  originAgendaUid: {
    type: 'integer',
    list: true,
  },
  sourceAgendaUid: {
    type: 'integer',
    list: true,
  },
  state: {
    optional: true,
    type: 'choice',
    options: [null, -1, 0, 1, 2],
    default: 2,
  },
  status: {
    optional: true,
    type: 'choice',
    options: [1, 2, 3, 4, 5, 6],
  },
  featured: {
    optional: true,
    type: 'boolean',
    allowNull: true,
    default: null,
  },
  attendanceMode: {
    optional: true,
    type: 'choice',
    options: [1, 2, 3],
  },
  geo: {
    fields: {
      northEast: {
        optional: false,
        fields: {
          lat: {
            type: 'latitude',
          },
          lng: {
            type: 'longitude',
          },
        },
      },
      southWest: {
        optional: false,
        fields: {
          lat: {
            type: 'latitude',
          },
          lng: {
            type: 'longitude',
          },
        },
      },
    },
  },
  localTime: {
    fields: {
      gte: {
        type: 'integer',
      },
      lte: {
        type: 'integer',
      },
    },
  },
  createdAt: {
    fields: {
      gte: {
        type: 'date',
      },
      lte: {
        type: 'date',
      },
    },
  },
  updatedAt: {
    fields: {
      gte: {
        type: 'date',
      },
      lte: {
        type: 'date',
      },
    },
  },
  timings: {
    fields: {
      gte: {
        type: 'date',
      },
      lte: {
        type: 'date',
      },
    },
  },
  sort: {
    type: 'choice',
    options: [
      'timings.asc',
      'timingsWithFeatured.asc',
      'lastTiming.asc',
      'lastTimingWithFeatured.asc',
      'updatedAt.desc',
      'updatedAt.asc',
      'location.name.asc',
      'location.city.asc',
      'location.name.desc',
      'location.city.desc',
      'score',
    ],
    optional: true,
    unique: true,
  },
});

const extractValue = (obj, fieldName) => {
  if (obj[fieldName] !== undefined) {
    return obj[fieldName];
  }

  if (obj?.custom?.[fieldName] !== undefined) {
    return obj.custom[fieldName];
  }

  return undefined;
};

function cleanAdditionalField(fieldSchema, dirty, { emptyValue }) {
  if (['radio', 'select', 'checkbox', 'multiselect'].includes(fieldSchema.fieldType)) {
    if (Array.isArray(dirty)) {
      return dirty.map(v => (v === emptyValue ? emptyValue : parseInt(v, 10)));
    }
    return dirty === emptyValue ? emptyValue : parseInt(dirty, 10);
  }

  return dirty;
}

function extractAdditionalValuesFromFields(fields, dirty, { emptyValue }) {
  return fields.reduce((additionalValues, fieldSchema) => {
    const { field } = fieldSchema;

    const value = field.schema ? extractAdditionalValuesFromFields(
      getFormSchemaAdditionalFields(field.schema).concat(field.schema.fields.filter(f => f.schema)),
      dirty[field.field],
      { emptyValue },
    ) : extractValue(dirty, field);

    if (value !== undefined) {
      const cleanValue = cleanAdditionalField(fieldSchema, value, { emptyValue });

      return {
        ...additionalValues,
        [field]: cleanValue,
      };
    }

    return additionalValues;
  }, {});
}

function validateQuery(dirty, { formSchema, emptyValue }) {
  const preCleaned = preCleanRawQuery(dirty);

  const clean = validate(preCleaned);

  if ((clean.search || '').length && !clean.sort) {
    clean.sort = 'score';
  } else if (!clean.sort) {
    clean.sort = 'timingsWithFeatured.asc';
  }

  const additionalFields = getFormSchemaAdditionalFields(formSchema);
  const fieldsWithSchema = (formSchema?.fields ?? []).filter(f => f.schema);

  const additionalValues = extractAdditionalValuesFromFields(
    additionalFields.concat(fieldsWithSchema),
    dirty,
    { emptyValue },
  );

  return {
    ...clean,
    ...additionalValues,
  };
}

module.exports = validateQuery;

module.exports.inflateAndClean = (query, options = {}) => {
  const {
    set = null,
    formSchema = null,
    emptyValue,
  } = options;

  const inflated = Object.keys(query).reduce((carry, key) => _.set(
    carry,
    key.split(/:|\./g),
    query[key],
  ), {});

  inflated.set = set;

  const derelativized = derelativize(inflated);

  return validateQuery(derelativized, { formSchema, emptyValue });
};
