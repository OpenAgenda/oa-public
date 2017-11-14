export function getIdentifiersSchema( identifiers, inbox ) {
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

  if ( inbox ) {
    return {
      required: [ 'userUid' ],
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
