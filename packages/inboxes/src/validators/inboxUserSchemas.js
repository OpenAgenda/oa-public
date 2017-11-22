export function getIdentifiersSchema( identifiers ) {
  return {
    required: identifiers && identifiers.id ? [ 'id' ] : [ 'inboxId', 'userUid' ],
    additionalProperties: false,
    properties: {
      id: {
        type: 'integer',
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

export const createSchema = {
  required: [ 'inboxId', 'userUid' ],
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
