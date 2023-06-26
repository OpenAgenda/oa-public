import groupTags from '@openagenda/react-form-components/validators/groupTags';
import set from '@openagenda/validators/set';
import text from '@openagenda/validators/text';
import link from '@openagenda/validators/link';
import phone from '@openagenda/validators/phone';
import email from '@openagenda/validators/email';
import timezone from '@openagenda/validators/text';
import list from '@openagenda/validators/list';
import number from '@openagenda/validators/number';
import latitude from '@openagenda/validators/latitude';
import longitude from '@openagenda/validators/longitude';
import pass from '@openagenda/validators/pass';
import multilingual from '@openagenda/validators/multilingual';
import regex from '@openagenda/validators/regex';
import choice from '@openagenda/validators/choice';

const validators = {
  groupTags,
  set,
  text,
  link,
  phone,
  email,
  timezone,
  list,
  number,
  latitude,
  longitude,
  pass,
  multilingual,
  regex,
  choice
};

const STATES = {
  tocontrol: 0,
  validated: 1,
};

const utils = require('@openagenda/utils');

function validateImageCredits(value, otherValues = {}, options = {}) {
  const {
    isEnabled = false,
  } = options;

  const hasImage = !!otherValues?.image;

  if (hasImage && isEnabled) {
    return validators.text({ field: 'imageCredits', max: 255, optional: false })(value);
  }

  return validators.text({ field: 'imageCredits', max: 255, optional: true })(value);
}

function validateImageRights(value, otherValues = {}, options = {}) {
  const {
    optional = true,
    isEnabled = false
  } = options;
  if (!isEnabled) return;

  const hasImage = !!otherValues?.image;

  if (!hasImage) {
    return;
  }
  const validateBoolean = validators.choice({
    options: [true],
    field: 'imageRightsAreHeld',
    optional,
    unique: true
  });
  return validateBoolean(value);
}

validateImageRights.field = 'imageRightsAreHeld';

// validators applying for all locations of all agendas
const baseValidators = [
  validators.number({ field: 'agendaId', optional: true }),
  validators.text({
    field: 'name', min: 3, max: 100, optional: false
  }),
  validators.pass({ field: 'image' }),
  validateImageCredits,
  validateImageRights,
  validators.text({
    field: 'address', min: 3, max: 255, optional: false
  }),
  validators.text({
    field: 'adminLevel1', min: 0, max: 300, optional: true
  }),
  validators.text({
    field: 'adminLevel2', min: 3, max: 300, optional: true
  }),
  validators.text({
    field: 'adminLevel3', min: 3, max: 300, optional: true
  }),
  validators.text({
    field: 'adminLevel4', min: 2, max: 300, optional: true
  }),
  validators.text({
    field: 'city', min: 2, max: 300, optional: true
  }),
  validators.text({ field: 'adminLevel5', optional: true }),
  validators.text({ field: 'adminLevel6', optional: true }),
  validators.text({ field: 'district', optional: true }),
  validators.text({
    field: 'department', min: 3, max: 300, optional: true
  }),
  validators.text({
    field: 'region', min: 0, max: 300, optional: true
  }),
  validators.text({
    field: 'postalCode', min: 3, max: 20, optional: true
  }),
  validators.text({
    field: 'insee', min: 3, max: 20, optional: true
  }),
  validators.text({
    field: 'countryCode', min: 2, max: 2, optional: false
  }),
  validators.text({
    field: 'eveId', min: 0, max: 42, optional: true
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
  }),
  validators.link({ field: 'website', min: 0, optional: true }),
  validators.email({ field: 'email', min: 0, optional: true }),
  validators.text({
    field: 'extId', min: 0, max: 255, optional: true
  }),
  validators.text({ field: 'timezone', min: 0, optional: true }),
  validators.phone({
    field: 'phone', min: 0, max: 42, optional: true
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
    const groupTagValidator = validators.groupTags(utils.extend({ field: 'tags' }, settings.tagSet));
    locationValidators.push(Object.assign(v => groupTagValidator(v), { field: 'tags' }));
  }

  return locationValidators;
}

function validate(data, pSettings/* , pPartial */, options = {}) {
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

  const {
    clean,
    errors
  } = locationValidators.reduce((carry, validator) => {
    const {
      field: fieldName
    } = validator;
    try {
      return {
        ...carry,
        clean: {
          ...carry.clean,
          [fieldName]: validator(data?.[fieldName], data, options)
        }
      };
    } catch (fieldErrors) {
      return {
        ...carry,
        errors: carry.errors.concat(fieldErrors),
      };
    }
  }, { clean: {}, errors: [] });

  if (errors.length) {
    throw errors;
  }

  return clean;
}

/**
 * extract one validator from list
 */

function field(name) {
  return baseValidators.filter(v => v.field === name)[0];
}

function _customImageValidator(options) {
  const v = validators.text(options);
  function imageValidate(value) {
    const clean = v(value);

    if (!clean) return null;

    return clean.split('/').pop();
  }

  return utils.extend(imageValidate, {
    field: options.field,
    type: 'text',
  });
}

export default utils.extend(validate, { field });
