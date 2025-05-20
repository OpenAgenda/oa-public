import _ from 'lodash';
import schema from '@openagenda/validators/schema/index.js';
import textValidator from '@openagenda/validators/text.js';
import integerValidator from '@openagenda/validators/integer.js';
import latitudeValidator from '@openagenda/validators/latitude.js';
import longitudeValidator from '@openagenda/validators/longitude.js';
import dateValidator from '@openagenda/validators/date.js';
import choiceValidator from '@openagenda/validators/choice.js';
import booleanValidator from '@openagenda/validators/boolean.js';
import getFormSchemaAdditionalFields from './getFormSchemaAdditionalFields.js';
import preCleanRawQuery from './preCleanRawQuery.js';
import derelativize from './derelativize.js';
import adminLevelSwap from './adminLevelSwap.js';

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
  locationExtId: {
    fields: {
      key: {
        type: 'text',
      },
      value: {
        type: 'text',
      },
    },
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
    // deprecated
    type: 'integer',
    list: true,
  },
  originAgenda: {
    fields: {
      uid: {
        type: 'integer',
        list: { default: null },
      },
      official: {
        type: 'boolean',
        allowNull: true,
        default: null,
      },
    },
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
  referencingAgendaUid: {
    type: 'integer',
    list: true,
  },
  notReferencingAgendaUid: {
    type: 'integer',
    list: true,
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
  extId: {
    fields: {
      key: {
        type: 'text',
      },
      value: {
        type: 'text',
      },
    },
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
    list: { default: null },
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
      'location.region.asc',
      'location.countryCode.asc',
      'location.department.asc',
      'location.adminLevel1.asc',
      'location.adminLevel2.asc',
      'location.adminLevel3.asc',
      'location.adminLevel4.asc',
      'location.adminLevel5.asc',
      'location.adminLevel6.asc',
      'location.district.asc',
      'location.name.desc',
      'location.city.desc',
      'location.region.desc',
      'location.countryCode.desc',
      'location.department.desc',
      'location.adminLevel1.desc',
      'location.adminLevel2.desc',
      'location.adminLevel3.desc',
      'location.adminLevel4.desc',
      'location.adminLevel5.desc',
      'location.adminLevel6.desc',
      'location.district.desc',
      'score',
    ],
    optional: true,
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

const isNumberLike = (value) =>
  !Number.isNaN(Number(value)) && Number.isFinite(parseInt(value, 10));

function getDefaultSort(clean, options) {
  const { removed } = options;

  if (removed !== false) {
    return 'updatedAt.asc';
  }
  if ((clean.search || '').length) {
    return 'score';
  }

  return 'timingsWithFeatured.asc';
}

function cleanAdditionalField(fieldSchema, dirty, { emptyValue }) {
  if (
    ['radio', 'select', 'checkbox', 'multiselect'].includes(
      fieldSchema.fieldType,
    )
  ) {
    if (Array.isArray(dirty)) {
      return dirty.map((v) =>
        (v === emptyValue ? emptyValue : parseInt(v, 10)));
    }
    return dirty === emptyValue ? emptyValue : parseInt(dirty, 10);
  }

  if (['number', 'integer'].includes(fieldSchema.fieldType)) {
    const clean = ['lt', 'lte', 'gt', 'gte'].reduce(
      (cleaned, operand) =>
        (isNumberLike(dirty[operand])
          ? {
            ...cleaned,
            [operand]: parseInt(dirty[operand], 10),
          }
          : cleaned),
      {},
    );

    return Object.keys(clean).length ? clean : undefined;
  }

  return dirty;
}

function extractAdditionalValuesFromFields(fields, dirty, { emptyValue }) {
  return fields.reduce((additionalValues, fieldSchema) => {
    const { field } = fieldSchema;

    const value = field.schema
      ? extractAdditionalValuesFromFields(
        getFormSchemaAdditionalFields(field.schema).concat(
          field.schema.fields.filter((f) => f.schema),
        ),
        dirty[field.field],
        { emptyValue },
      )
      : extractValue(dirty, field);

    if (value !== undefined) {
      const cleanValue = cleanAdditionalField(fieldSchema, value, {
        emptyValue,
      });

      return {
        ...additionalValues,
        [field]: cleanValue,
      };
    }

    return additionalValues;
  }, {});
}

function filterNullCountryCode(dirty) {
  if (
    dirty.countryCode
    && dirty.countryCode.length
    && dirty.countryCode.includes('null')
  ) {
    return true;
  }
  return false;
}

function mapAdminLevelSort(sort) {
  if (
    sort
    && sort.length
    && sort.some((s) =>
      adminLevelSwap.map
        .map((e) => e.al)
        .includes(
          s.replace('location.', '').replace('.asc', '').replace('.desc', ''),
        ))
  ) {
    return sort.map((s) => {
      if (
        adminLevelSwap.map
          .map((e) => e.al)
          .includes(
            s.replace('location.', '').replace('.asc', '').replace('.desc', ''),
          )
      ) {
        const adminLevel = adminLevelSwap.map.find(
          (e) =>
            e.al
            === s.replace('location.', '').replace('.asc', '').replace('.desc', ''),
        );
        return s.replace(adminLevel.al, adminLevel.to);
      }
      return s;
    });
  }
  return sort;
}

function validateQuery(dirty, options = {}) {
  const { formSchema, emptyValue } = options;
  const isCountryCodeNull = filterNullCountryCode(dirty);

  const preCleaned = preCleanRawQuery(dirty, options);

  const clean = validate(preCleaned);

  clean.sort = mapAdminLevelSort(clean.sort);

  if (isCountryCodeNull) {
    clean.countryCode = clean.countryCode.concat(['null']);
  }

  if (!clean.sort || !clean.sort.length) {
    clean.sort = getDefaultSort(clean, options);
  }

  const additionalFields = getFormSchemaAdditionalFields(formSchema);
  const fieldsWithSchema = (formSchema?.fields ?? []).filter((f) => f.schema);

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

export default validateQuery;

export function inflateAndClean(query, options = {}) {
  const {
    set = null,
    formSchema = null,
    emptyValue,
    removed = false,
  } = options;

  const inflated = Object.keys(query).reduce(
    (carry, key) => _.set(carry, key.split(/:|\./g), query[key]),
    {},
  );

  inflated.set = set;

  const derelativized = derelativize(inflated);

  return validateQuery(derelativized, { formSchema, emptyValue, removed });
}
