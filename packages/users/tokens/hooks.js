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
const { beforeWrapper, afterWrapper } = require('../utils/wrappers');

module.exports = {
  find: [
    ...beforeWrapper(
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
    ),
    ...afterWrapper(camelCase(), camelCaseQuery())
  ],
  get: [
    ...beforeWrapper(disallow('external'), snakeCase(), snakeCaseQuery()),
    ...afterWrapper(camelCase(), camelCaseQuery(), async context => {
      if (!context.result && context.params.createIfNotExist) {
        context.result = await this.create(
          _.pick(context.params.query, 'email', 'type', 'userId')
        );
      }
    })
  ],
  create: [
    ...beforeWrapper(
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
    ),
    ...afterWrapper(camelCase(), camelCaseQuery(), callInterface('sendToken'))
  ],
  update: [
    ...beforeWrapper(disallow('external')),
    ...afterWrapper(camelCase(), camelCaseQuery())
  ],
  patch: [
    ...beforeWrapper(disallow('external')),
    ...afterWrapper(camelCase(), camelCaseQuery())
  ],
  remove: [
    ...beforeWrapper(disallow('external')),
    ...afterWrapper(camelCase(), camelCaseQuery())
  ]
};
