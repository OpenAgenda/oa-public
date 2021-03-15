export function getIdentifiersSchema(identifiers) {
  return {
    type: 'object',
    required: identifiers && identifiers.id ? ['id'] : ['inboxId', 'userUid'],
    additionalProperties: false,
    properties: {
      id: {
        type: 'integer',
      },
      inboxId: {
        type: 'integer',
      },
      userUid: {
        type: 'integer',
      },
    },
  };
}

export function getListSchema(query) {
  return {
    type: 'object',
    required: [query.userUid ? 'userUid' : 'inboxId'],
    additionalProperties: false,
    properties: {
      inboxId: {
        items: { type: 'integer' },
        uniqueItems: true,
      },
      userUid: {
        type: 'integer',
      },
    },
  };
}

export const createSchema = {
  type: 'object',
  required: ['inboxId', 'userUid'],
  additionalProperties: false,
  properties: {
    inboxId: {
      type: 'integer',
    },
    userUid: {
      type: 'integer',
    },
  },
};
