export function getIdentifiersSchema( identifiers ) {
  if ( identifiers && identifiers.id ) {
    return {
      required: [ 'id' ],
      additionalProperties: false,
      properties: {
        id: {
          type: 'integer',
        }
      }
    };
  }

  return {
    required: [ 'type', 'identifier' ],
    additionalProperties: false,
    properties: {
      type: {
        type: 'string'
      },
      identifier: {
        type: 'integer'
      }
    }
  }
}

export const createSchema = {
  required: [ 'type', 'identifier' ],
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
