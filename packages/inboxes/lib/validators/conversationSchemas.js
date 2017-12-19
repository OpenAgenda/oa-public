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
  required: ['type'],
  additionalProperties: false,
  properties: {
    type: {
      type: 'string'
    },
    typeIdentifier: {
      type: 'integer'
    },
    params: {
      type: 'object'
    },
    message: {
      type: 'string'
    }
  }
};

var listSchema = exports.listSchema = {
  additionalProperties: false,
  properties: {
    type: {
      type: 'string'
    },
    typeIdentifier: {
      type: 'integer'
    }
  }
};

var updateSchema = exports.updateSchema = {
  additionalProperties: false,
  properties: {
    resolvedAt: {
      instanceof: 'Date'
    },
    closedAt: {
      oneOf: [{ type: 'null' }, { instanceof: 'Date' }]
    },
    params: {
      type: 'object'
    }
  }
};
//# sourceMappingURL=conversationSchemas.js.map