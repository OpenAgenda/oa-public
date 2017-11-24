"use strict";

var _ = require('lodash');
var schema = require('@openagenda/validators/schema');

schema.register({
  choice: require('@openagenda/validators/choice'),
  integer: require('@openagenda/validators/integer'),
  text: require('@openagenda/validators/text'),
  link: require('@openagenda/validators/link'),
  date: require('@openagenda/validators/date'),
  boolean: require('@openagenda/validators/boolean')
});

var writableFields = {
  flash: {
    type: 'text',
    max: 1000
  },
  messages: {
    newFlag: {
      type: 'boolean',
      default: false
    }
  },
  notifications: {
    updatedAt: {
      type: 'date',
      default: null
    },
    count: {
      type: 'integer',
      default: null
    }
  }
};

var fields = {
  user: {
    optional: true,
    fields: {
      culture: {
        type: 'choice',
        optional: false,
        unique: true,
        options: ['fr', 'en']
      },
      uid: {
        type: 'integer',
        optional: false
      },
      name: {
        type: 'text',
        optional: false
      },
      thumbnail: {
        type: 'link',
        optional: true
      }
    }
  }
};

// jumping through hoops because an empty subobject in schema is processed
// as default: user is not always specified.

var validateWritable = schema(writableFields);

var validateLogged = schema(fields);

var validateUnlogged = schema(_.omit(fields, ['user']));

module.exports = _.extend(_validate, {
  validateLogged: validateLogged,
  validateUnlogged: validateUnlogged,
  writable: validateWritable
});

function _validate(dirty) {

  if (dirty && _.isObject(dirty) && !dirty.user) {

    return validateUnlogged(dirty);
  }

  return validateLogged(dirty);
}
//# sourceMappingURL=cookie.validate.js.map