'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIdentifiersSchema = getIdentifiersSchema;
function getIdentifiersSchema(identifiers) {
  if (identifiers && identifiers.id) {
    return {
      required: ['id'],
      additionalProperties: false,
      properties: {
        id: {
          type: 'integer'
        }
      }
    };
  }

  return {
    required: ['type', 'identifier'],
    additionalProperties: false,
    properties: {
      type: {
        type: 'string'
      },
      identifier: {
        type: 'integer'
      }
    }
  };
}

var createSchema = exports.createSchema = {
  required: ['type', 'identifier'],
  additionalProperties: false,
  properties: {
    type: {
      type: 'string'
    },
    identifier: {
      type: 'integer'
    }
  }
};
//# sourceMappingURL=inboxSchemas.js.map