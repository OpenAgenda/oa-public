import set from '@openagenda/validators/set.js';
import text from '@openagenda/validators/text.js';
import link from '@openagenda/validators/link.js';
import phone from '@openagenda/validators/phone.js';
import email from '@openagenda/validators/email.js';
import list from '@openagenda/validators/list.js';
import number from '@openagenda/validators/number.js';
import latitude from '@openagenda/validators/latitude.js';
import longitude from '@openagenda/validators/longitude.js';
import pass from '@openagenda/validators/pass.js';
import multilingual from '@openagenda/validators/multilingual.js';
import regex from '@openagenda/validators/regex.js';
import choice from '@openagenda/validators/choice.js';
import address from '@openagenda/agenda-locations/validators/address.js';
// TODO use `groupTagsValidator`
// import groupTagsValidator from './groupTagsValidator';

/**
 * errors are a list of objects that contain the following fields
 *   - a message
 *   - a field name
 *   - a group name
 *   - a code
 *   - the origin value of the error
 *   - values relevent to the error ( optional )
 */

function groupTags(set1) {
  function validateGroup(group, values) {
    if (!group.required) return;

    const ids = (values || []).map((v) => v.id);

    if (!group.tags.filter((t) => ids.indexOf(t.id) !== -1).length) {
      // eslint-disable-next-line no-throw-literal
      throw [
        {
          field: set1.field,
          group: group.name ? group.name : 'Tags',
          code: 'groupTags.required',
          message: 'a selection is required',
          origin: group.tags,
          values: {},
        },
      ];
    }

    // no cleaning.
    return values;
  }

  function validate1(values, groupIndex) {
    if (groupIndex !== undefined) return validateGroup(set1.groups[groupIndex], values);

    let errors = [];

    set1.groups.forEach((group) => {
      try {
        validateGroup(group, values);
      } catch (errs) {
        errors = errors.concat(errs);
      }
    });

    if (errors.length) throw errors;

    // no cleaning for this
    return values;
  }

  validate1.fields = set1.field;

  return validate1;
}

const validators = {
  groupTags,
  set,
  text,
  link,
  phone,
  email,
  timezone: text,
  list,
  number,
  latitude,
  longitude,
  pass,
  multilingual,
  regex,
  choice,
  address,
};

const STATES = {
  tocontrol: 0,
  validated: 1,
};

function validateImage(value) {
  const maxSize = 20 * 1024 * 1024;

  if (value && value.fileSize > maxSize) {
    // eslint-disable-next-line no-throw-literal
    throw [
      {
        code: 'file.tooBig',
        message: 'File is too big',
        field: 'image',
        maxSize,
      },
    ];
  }

  return value;
}

function validateImageCredits(value, otherValues = {}, options = {}) {
  const { isEnabled = false } = options;

  const hasImage = !!otherValues?.image;
  if (hasImage && isEnabled) {
    return validators.text({
      field: 'imageCredits',
      max: 255,
      optional: false,
      rejectEmojis: true,
    })(value);
  }

  return validators.text({
    field: 'imageCredits',
    max: 255,
    optional: true,
    rejectEmojis: true,
  })(value);
}

function validateImageRights(value, otherValues = {}, options = {}) {
  const { isEnabled = false } = options;
  if (!isEnabled) return;

  const hasImage = !!otherValues?.image;
  if (!hasImage) {
    return;
  }
  const validateBoolean = validators.choice({
    options: [true],
    field: 'imageRightsAreHeld',
    optional: !isEnabled,
    unique: true,
  });
  return validateBoolean(value);
}

const validateSIRETRegex = validators.regex({
  field: 'siret',
  error: {
    code: 'invalidSIRET',
  },
  max: 14,
  min: 14,
  regex: /^[0-9]+$/,
  optional: true,
});

function validateSIRET(value, _otherValues = {}, options = {}) {
  if (!options.displaySIRETInput) {
    return;
  }

  return validateSIRETRegex(value);
}

function validateExtId(value, _otherValues = {}, _options = {}) {
  if (value === '') return null;
  if (!value) return undefined;
  return validators.text({
    field: 'extId',
    min: 0,
    max: 100,
    optional: true,
    rejectEmojis: true,
  })(value);
}

validateExtId.field = 'extId';
validateImage.field = 'image';
validateImageRights.field = 'imageRightsAreHeld';
validateImageCredits.field = 'imageCredits';
validateSIRET.field = 'siret';

// validators applying for all locations of all agendas
const baseValidators = [
  validators.number({ field: 'agendaId', optional: true }),
  validators.text({
    field: 'name',
    min: 3,
    max: 100,
    optional: false,
    rejectEmojis: true,
  }),
  validators.pass({ field: 'image' }),
  validateImage,
  validateImageCredits,
  validateImageRights,
  validateSIRET,
  validateExtId,
  validators.address({
    field: 'address',
    min: 3,
    max: 255,
    optional: false,
    rejectEmojis: true,
  }),
  validators.text({
    field: 'adminLevel1',
    min: 0,
    max: 300,
    optional: true,
    rejectEmojis: true,
  }),
  validators.text({
    field: 'adminLevel2',
    min: 3,
    max: 300,
    optional: true,
    rejectEmojis: true,
  }),
  validators.text({
    field: 'adminLevel3',
    min: 3,
    max: 300,
    optional: true,
    rejectEmojis: true,
  }),
  validators.text({
    field: 'adminLevel4',
    min: 2,
    max: 300,
    optional: true,
    rejectEmojis: true,
  }),
  validators.text({
    field: 'city',
    min: 2,
    max: 300,
    optional: true,
    rejectEmojis: true,
  }),
  validators.text({ field: 'adminLevel5', optional: true, rejectEmojis: true }),
  validators.text({ field: 'adminLevel6', optional: true, rejectEmojis: true }),
  validators.text({ field: 'district', optional: true, rejectEmojis: true }),
  validators.text({
    field: 'department',
    min: 3,
    max: 300,
    optional: true,
    rejectEmojis: true,
  }),
  validators.text({
    field: 'region',
    min: 0,
    max: 300,
    optional: true,
    rejectEmojis: true,
  }),
  validators.text({
    field: 'postalCode',
    min: 3,
    max: 20,
    rejectEmojis: true,
    optional: true,
  }),
  validators.text({
    field: 'insee',
    min: 3,
    max: 20,
    rejectEmojis: true,
    optional: true,
  }),
  validators.text({
    field: 'countryCode',
    min: 2,
    max: 2,
    optional: false,
  }),
  validators.text({
    field: 'eveId',
    min: 0,
    max: 42,
    rejectEmojis: true,
    optional: true,
  }),
  validators.multilingual({
    field: 'description',
    max: 5000,
    optional: true,
    defaultLanguage: 'fr',
  }),
  validators.multilingual({
    field: 'access',
    max: 1000,
    optional: true,
    defaultLanguage: 'fr',
    rejectEmojis: true,
  }),
  validators.link({ field: 'website', min: 0, optional: true }),
  validators.email({ field: 'email', min: 0, optional: true }),
  validators.text({ field: 'timezone', min: 0, optional: true }),
  validators.phone({
    field: 'phone',
    min: 0,
    max: 42,
    optional: true,
  }),
  validators.latitude({ field: 'latitude', optional: true }),
  validators.longitude({ field: 'longitude', optional: true }),
  validators.number({
    field: 'state',
    min: STATES.tocontrol,
    max: STATES.validated,
    default: STATES.validated,
  }),
  validators.list({ field: 'links', optional: true }, [validators.link()]),

  // suggestions are validated individually as partial locations
  validators.pass({ field: 'suggestions' }),
];

/**
 * establish full list of location validators
 * based on settings
 */

function _getValidators(settings) {
  const locationValidators = baseValidators.concat([]);

  if (settings.forceTags) {
    locationValidators.push(validators.pass({ field: 'tags' }));
  } else if (settings.tagSet) {
    const groupTagValidator = validators.groupTags({
      field: 'tags',
      ...settings.tagSet,
    });
    locationValidators.push(
      Object.assign((v) => groupTagValidator(v), { field: 'tags' }),
    );
  }

  return locationValidators;
}

function validate(data, pSettings /* , pPartial */, options = {}) {
  let locationValidators = [];
  let settings = pSettings;
  /* let partial = pPartial; */
  // clean arguments

  /*   if (arguments.length === 2 && typeof settings === 'boolean') {
    partial = settings;
    settings = {};
  } else if (arguments.length === 1) {
    settings = {};
  } */

  if (!settings) settings = {};

  // establish validators depending on settings

  /*   if (partial) {
    locationValidators = _getValidators(settings).filter(v => Object.keys(data).indexOf(v.field) !== -1);
  } else { */
  locationValidators = _getValidators(settings);
  /* } */

  const { clean, errors } = locationValidators.reduce(
    (carry, validator) => {
      const { field: fieldName } = validator;
      try {
        return {
          ...carry,
          clean: {
            ...carry.clean,
            [fieldName]: validator(data?.[fieldName], data, options),
          },
        };
      } catch (fieldErrors) {
        return {
          ...carry,
          errors: carry.errors.concat(fieldErrors),
        };
      }
    },
    { clean: {}, errors: [] },
  );

  if (errors.length) {
    throw errors;
  }

  return clean;
}

/**
 * extract one validator from list
 */

function field(name) {
  return baseValidators.filter((v) => v.field === name)[0];
}

export default Object.assign(validate, { field });
