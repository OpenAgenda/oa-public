export const identifiersSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'integer'
    }
  }
};

export const createSchema = {
  type: 'object',
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

export const listSchema = {
  type: 'object',
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

export const updateSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    updatedAt: {
      instanceof: 'Date'
    },
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
