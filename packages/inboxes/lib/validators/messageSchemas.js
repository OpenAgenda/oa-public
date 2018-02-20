'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var identifiersSchema = exports.identifiersSchema = {
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'integer'
    }
  }
};

var createSchema = exports.createSchema = {
  required: ['conversationId', 'inboxUserId', 'body'],
  additionalProperties: false,
  properties: {
    conversationId: {
      type: 'integer'
    },
    inboxUserId: {
      type: 'integer'
    },
    body: {
      type: 'string',
      maxLength: 3000
    }
  }
};
//# sourceMappingURL=messageSchemas.js.map