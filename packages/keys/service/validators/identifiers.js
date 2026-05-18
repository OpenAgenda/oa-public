import schema from '@openagenda/validators/schema/index';
import choice from '@openagenda/validators/choice';
import text from '@openagenda/validators/text';
import number from '@openagenda/validators/number';
import keyTypes from '../lib/keyTypes.js';

schema.register({
  choice,
  text,
  number,
});

export default (identifiers, options) => {
  const params = {
    allowId: true,
    optionalKey: false,
    keyOrIdentifier: false,
    ...options,
  };

  if (params.allowId && typeof identifiers === 'number') {
    return { id: identifiers };
  }

  if (identifiers.id) {
    return identifiers;
  }

  // type (required) + identifier (required)
  // type (required) + identifier (required) + key (required)
  // type (required) + key (required)
  // type (required) + key + identifier (at least one)
  // already as string

  const validateSchema = {
    type: {
      type: 'choice',
      optional: false,
      options: keyTypes,
      unique: true,
    },
  };

  if (params.keyOrIdentifier) {
    if (
      typeof identifiers.key === 'undefined'
      && typeof identifiers.identifier === 'undefined'
    ) {
      // eslint-disable-next-line no-throw-literal
      throw {
        code: 'required',
        field: 'key',
        message: 'a key or an identifier is required',
        origin: undefined,
      };
    }

    if (typeof identifiers.key !== 'undefined') {
      validateSchema.type = {
        type: 'choice',
        optional: true,
        options: keyTypes,
        unique: true,
        default: undefined,
      };

      validateSchema.key = {
        type: 'text',
        optional: false,
      };

      if (!validateSchema.identifier) {
        validateSchema.identifier = {
          type: 'text',
          optional: true,
          default: undefined,
        };
      }
    }

    if (typeof identifiers.identifier !== 'undefined') {
      validateSchema.identifier = {
        type: 'text',
        optional: false,
      };

      validateSchema.key = {
        type: 'text',
        optional: true,
        default: undefined,
      };
    }
  } else {
    validateSchema.identifier = {
      type: 'number',
      optional: false,
    };
  }

  if (!params.optionalKey) {
    validateSchema.key = {
      type: 'text',
      optional: false,
    };
  }

  return schema(validateSchema)(identifiers);
};
