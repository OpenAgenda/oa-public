'use strict';

const _ = require('lodash');
const { disallow } = require('feathers-hooks-common');
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
  find: wrap({
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
  }),
  get: wrap({
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
  }),
  create: wrap({
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
  }),
  update: wrap({
    before: [disallow('external')],
    after: [camelCase(), camelCaseQuery()]
  }),
  patch: wrap({
    before: [disallow('external')],
    after: [camelCase(), camelCaseQuery()]
  }),
  remove: wrap({
    before: [disallow('external')],
    after: [camelCase(), camelCaseQuery()]
  })
};
