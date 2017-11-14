'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIdentifiersSchema = getIdentifiersSchema;
function getIdentifiersSchema(identifiers, inbox) {
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

  if (inbox) {
    return {
      required: ['userUid'],
      additionalProperties: false,
      properties: {
        inboxId: {
          type: 'integer'
        },
        userUid: {
          type: 'integer'
        }
      }
    };
  }

  return {
    required: ['inboxId', 'userUid'],
    additionalProperties: false,
    properties: {
      inboxId: {
        type: 'integer'
      },
      userUid: {
        type: 'integer'
      }
    }
  };
};

var createSchema = exports.createSchema = {
  required: ['inboxId', 'userUid'],
  additionalProperties: false,
  properties: {
    inboxId: {
      type: 'integer'
    },
    userUid: {
      type: 'integer'
    }
  }
};
//# sourceMappingURL=inboxUserSchemas.js.map