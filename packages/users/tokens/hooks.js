'use strict';

const _ = require('lodash');
const { disallow } = require('feathers-hooks-common');
const { withParams } = require('@openagenda/hooks');
const {
  callInterface,
  camelCase,
  camelCaseQuery,
  snakeCase,
  snakeCaseQuery,
  generateToken
} = require('../hooks/index');
const { wrap } = require('../utils/wrappers');

module.exports = {
  find: {
    context: withParams(['params', {}]),
    middleware: wrap({
      before: [
        disallow('external'),
        context => {
          const query = context.params.query || {};

          switch (query.type) {
            case 'activateAccount':
              query.type = 'aa';
              break;
            case 'lostPassword':
              query.type = 'lp';
              break;
            default:
              break;
          }

          context.params.query = query;
        },
        snakeCase(),
        snakeCaseQuery()
      ],
      after: [camelCase(), camelCaseQuery()]
    })
  },
  get: {
    context: withParams('id', ['params', {}]),
    middleware: wrap({
      before: [disallow('external'), snakeCase(), snakeCaseQuery()],
      after: [
        camelCase(),
        camelCaseQuery(),
        async context => {
          if (!context.result && context.params.createIfNotExist) {
            context.result = await this.create(
              _.pick(context.params.query, 'email', 'type', 'userId')
            );
          }
        }
      ]
    })
  },
  create: {
    context: withParams('data', ['params', {}]),
    middleware: wrap({
      before: [
        disallow('external'),
        generateToken('data.token'),
        context => {
          switch (context.data.type) {
            case 'activateAccount':
              context.data.type = 'aa';
              break;
            case 'lostPassword':
              context.data.type = 'lp';
              break;
            default:
              break;
          }
        },
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
};
