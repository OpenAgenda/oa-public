export function getIdentifiersSchema(identifiers) {
  if (identifiers && identifiers.id) {
    return {
      type: 'object',
      required: ['id'],
      additionalProperties: false,
      properties: {
        id: {
          type: 'integer'
        },
        type: {
          type: 'string'
        },
        identifier: {
          type: 'integer'
        }
      }
    };
  }

  return {
    type: 'object',
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

export const createSchema = {
  type: 'object',
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
