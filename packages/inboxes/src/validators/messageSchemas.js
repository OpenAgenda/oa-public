export const identifiersSchema = {
  required: [ 'id' ],
  additionalProperties: false,
  properties: {
    id: {
      type: 'integer',
    }
  }
};

export const createSchema = {
  required: [ 'conversationId', 'inboxUserId', 'body' ],
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
