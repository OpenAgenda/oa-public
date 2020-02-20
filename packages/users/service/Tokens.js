'use strict';

const { Service } = require('feathers-knex');
const { disallow } = require('feathers-hooks-common');
const { hooks, withParams } = require('@feathersjs/hooks');
const {
  callInterface,
  camelCase,
  camelCaseQuery,
  createTokenIfNotExist,
  error: errorHook,
  generateToken,
  snakeCase,
  snakeCaseQuery,
  transformTokenType
} = require('../hooks');
const { wrap } = require('../utils/wrappers');

class Tokens extends Service {
  constructor(options) {
    const config = { id: 'id', ...options };

    super(config);

    this.config = config;
  }

  async findOne(params = {}) {
    params.query = params.query || {};
    params.query.$limit = 1;

    const result = await this.find(params);
    const data = result.data || result;

    return Array.isArray(data) ? data[0] : data;
  }
}

hooks(Tokens.prototype, [errorHook()]);
hooks(Tokens.prototype, {
  find: {
    context: withParams(['params', {}]),
    middleware: wrap({
      before: [
        disallow('external'),
        transformTokenType('params.query'),
        snakeCase(),
        snakeCaseQuery()
      ],
      after: [camelCase(), camelCaseQuery(), createTokenIfNotExist()]
    })
  },
  get: {
    context: withParams('id', ['params', {}]),
    middleware: wrap({
      before: [disallow('external'), snakeCase(), snakeCaseQuery()],
      after: [camelCase(), camelCaseQuery(), createTokenIfNotExist()]
    })
  },
  create: {
    context: withParams('data', ['params', {}]),
    middleware: wrap({
      before: [
        disallow('external'),
        generateToken('data.token'),
        transformTokenType('data'),
        snakeCase(),
        snakeCaseQuery()
      ],
      after: [camelCase(), camelCaseQuery(), callInterface('sendToken')]
    })
  },
  update: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [disallow('external')],
      after: [camelCase(), camelCaseQuery()]
    })
  },
  patch: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [disallow('external')],
      after: [camelCase(), camelCaseQuery()]
    })
  },
  remove: {
    context: withParams('id', ['params', {}]),
    middleware: wrap({
      before: [disallow('external')],
      after: [camelCase(), camelCaseQuery()]
    })
  }
});

module.exports = Tokens;
