'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIdentifiersSchema = getIdentifiersSchema;
exports.getListSchema = getListSchema;
function getIdentifiersSchema(identifiers) {
  return {
    required: identifiers && identifiers.id ? ['id'] : ['inboxId', 'userUid'],
    additionalProperties: false,
    properties: {
      id: {
        type: 'integer'
      },
      inboxId: {
        type: 'integer'
      },
      userUid: {
        type: 'integer'
      }
    }
  };
};

function getListSchema(query) {
  return {
    required: [query.userUid ? 'userUid' : 'inboxId'],
    additionalProperties: false,
    properties: {
      inboxId: {
        items: { type: 'integer' },
        uniqueItems: true
      },
      userUid: {
        type: 'integer'
      }
    }
  };
}

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