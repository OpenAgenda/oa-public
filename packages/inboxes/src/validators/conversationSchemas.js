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
  required: [ 'type' ],
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
    },
  }
};

export const listSchema = {
  additionalProperties: false,
  properties: {
    type: {
      type: 'string'
    },
    typeIdentifier: {
      type: 'integer'
    },
  }
};

export const updateSchema = {
  additionalProperties: false,
  properties: {
    updatedAt: {
      instanceof: 'Date'
    },
    resolvedAt: {
      instanceof: 'Date'
    },
    closedAt: {
      oneOf: [
        { type: 'null' },
        { instanceof: 'Date' }
      ]
    },
    params: {
      type: 'object'
    }
  }
};
