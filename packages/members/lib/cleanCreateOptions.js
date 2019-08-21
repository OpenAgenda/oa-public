'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  boolean: require('@openagenda/validators/boolean'),
  text: require('@openagenda/validators/text'),
  integer: require('@openagenda/validators/integer')
});

module.exports = schema({
  requireCustom: {
    type: 'boolean',
    default: true
  },
  context: {
    lang: {
      type: 'text',
      default: null,
      max: 2
    },
    sender: {
      userUid: {
        type: 'integer',
        default: null
      },
      memberName: {
        type: 'text',
        default: null
      }
    },
    message: {
      type: 'text',
      default: null
    }
  }
});
