'use strict';

const _ = require('lodash');
const {
  iff,
  keep,
  discardQuery,
  fastJoin,
  paramsFromClient,
  setNow,
  isProvider
} = require('feathers-hooks-common');
const { withParams } = require('@openagenda/hooks');
const schema = require('@openagenda/validators/schema');
const validators = require('@openagenda/validators');
const {
  callInterface,
  camelCase,
  camelCaseQuery,
  checkUnicity,
  coerce,
  compareFields,
  detailedParamHook,
  formatStore,
  generateApiKey,
  generateToken,
  generateHash,
  generateUid,
  generateUniqueToken,
  hashPassword,
  includeImagePathParamHook,
  isValidToken,
  parseStore,
  populateAccountTypes,
  removedParamHook,
  searchByKey,
  searchKeyword,
  setInStore,
  snakeCase,
  snakeCaseQuery,
  softDelete: _softDelete,
  stashBefore,
  validate,
  verifyPassword
} = require('../hooks');
const { wrap } = require('../utils/wrappers');
const fields = require('./fields');
const resolvers = require('./resolvers');
const createSchema = require('./schemas/create');
const patchSchema = require('./schemas/patch');
const requestChangeEmailSchema = require('./schemas/requestChangeEmail');
const changePasswordSchema = require('./schemas/changePassword');
const setNewFlagSchema = require('./schemas/setNewFlag');
const coerceSchema = require('./schemas/coerce');

schema.register({
  text: validators.text,
  email: validators.email,
  boolean: validators.boolean,
  pass: validators.pass
});

function softDelete() {
  return _softDelete('isRemoved', {
    provider: undefined,
    detailed: true,
    includeImagePath: false
  });
}

function keepFields() {
  return context => {
    if (context.result === null || context.params.internal === true) {
      return context;
    }

    const additionalFields = [
      'hasSocialAccount',
      'hasLocalAccount',
      'apiKey',
      'apiSecret'
    ];

    return keep(
      ...(context.params.detailed
        ? [...fields.basic, ...fields.detailed, ...additionalFields]
        : [...fields.basic, ...additionalFields])
    )(context);
  };
}

function validateCreate() {
  return context => validate({
    ...createSchema,
    // Allow server to create an activated user
    ...(isProvider('server')(context)
      ? {
        isActivated: {
          type: 'boolean',
          default: false
        }
      }
      : {}),
    // Allow password to be optional for a social registration
    ...(['twitterId', 'googleId', 'facebookUid'].some(key => _.get(context.data, key))
      ? {
        password: {
          type: 'text',
          min: 4,
          optional: true
        }
      }
      : {})
  })(context);
}

function createActivationToken() {
  return async context => {
    if (context.result && !context.result.isActivated) {
      const tokensSvc = context.self.config.getTokensService();

      context.params.activationToken = await tokensSvc.create(
        {
          type: 'activateAccount',
          userId: context.result.id,
          email: context.result.email
        },
        {
          optionals: context.params.tokenOptionals,
          user: context.result
        }
      );
    }
  };
}

const afterAll = [
  camelCase(),
  camelCaseQuery(),
  keepFields(),
  includeImagePathParamHook(),
  coerce(coerceSchema),
  fastJoin({ joins: resolvers }),
  parseStore()
];

module.exports = {
  find: {
    context: withParams(['params', {}]),
    middleware: wrap({
      before: [
        paramsFromClient('detailed', 'removed', 'includeImagePath'),
        removedParamHook(),
        detailedParamHook(),
        softDelete(),
        snakeCaseQuery(),
        searchByKey(),
        searchKeyword()
      ],
      after: [...afterAll, populateAccountTypes()]
    })
  },
  get: {
    context: withParams('id', ['params', {}]),
    middleware: wrap({
      before: [
        stashBefore('before', { internal: true, provider: undefined }),
        paramsFromClient('detailed', 'removed', 'includeImagePath'),
        removedParamHook(),
        detailedParamHook(),
        softDelete(),
        snakeCaseQuery()
      ],
      after: [...afterAll, populateAccountTypes()]
    })
  },
  create: {
    context: withParams('data', ['params', {}]),
    middleware: wrap({
      before: [
        paramsFromClient('detailed', 'removed', 'includeImagePath'),
        validateCreate(),
        checkUnicity('email'),
        generateUid(),
        generateHash('salt'),
        generateUniqueToken('replyToken'),
        iff(
          context => _.get(context.data, 'password'),
          hashPassword('data.password', 'data.salt')
        ),
        setNow('createdAt', 'updatedAt'),
        callInterface('beforeCreate'),
        formatStore(),
        softDelete(),
        snakeCase(),
        snakeCaseQuery()
      ],
      after: [
        ...afterAll,
        populateAccountTypes(),
        createActivationToken(),
        callInterface('onCreate'),
        iff(
          context => context.result && context.result.isActivated,
          callInterface('onActivation'),
          fastJoin({ joins: resolvers })
        )
      ]
    })
  },
  update: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: []
  },
  patch: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [
        stashBefore('before', { internal: true, provider: undefined }),
        iff(
          context => context.params.internal !== true,
          context => validate(_.pick(patchSchema, Object.keys(context.data)))(context),
          keep('fullName', 'culture')
        ),
        setNow('updatedAt'),
        paramsFromClient('detailed', 'removed', 'includeImagePath'),
        softDelete(),
        formatStore(),
        snakeCase(),
        snakeCaseQuery()
      ],
      after: [
        ...afterAll,
        populateAccountTypes(),
        iff(
          context => !context.params.before.isActivated && context.result.isActivated,
          callInterface('onActivation'),
          fastJoin({ joins: resolvers })
        )
      ]
    })
  },
  remove: {
    context: withParams('id', ['params', {}]),
    middleware: wrap({
      before: [
        stashBefore('before', { internal: true, provider: undefined }),
        paramsFromClient('detailed', 'removed', 'includeImagePath'),
        softDelete(),
        callInterface('beforeRemove'),
        snakeCase(),
        snakeCaseQuery()
      ]
    })
  },
  setImageProfile: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: softDelete()
    })
  },
  clearImageProfile: {
    context: withParams('id', ['params', {}]),
    middleware: wrap({
      before: softDelete()
    })
  },
  requestChangeEmail: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [
        stashBefore('before', { internal: true, provider: undefined }),
        softDelete(),
        validate(requestChangeEmailSchema),
        checkUnicity('email', 'data.newEmail'),
        iff(isProvider('external'), verifyPassword()),
        generateToken('newEmailToken'),
        setInStore('newEmailToken', 'newEmailToken'),
        setInStore('newEmail', 'data.newEmail'),
        keep('store'),
        formatStore()
      ],
      after: [...afterAll, populateAccountTypes()]
    })
  },
  confirmChangeEmail: {
    context: withParams('id', ['params', {}]),
    middleware: wrap({
      before: [
        stashBefore('before', { internal: true, provider: undefined }),
        softDelete(),
        isValidToken('params.before.store.newEmailToken', 'params.query.token'),
        checkUnicity('email', 'params.before.store.newEmail'),
        // changeEmailFromStore(),
        discardQuery('token'),
        keep()
      ],
      after: [...afterAll]
    })
  },
  changePassword: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [
        stashBefore('before', { internal: true, provider: undefined }),
        softDelete(),
        validate(changePasswordSchema),
        iff(
          isProvider('external'),
          verifyPassword('oldPassword'),
          compareFields('password', 'confirmation')
        ),
        hashPassword('data.password', 'params.before.salt'),
        keep('password')
      ],
      after: [...afterAll, populateAccountTypes()]
    })
  },
  generateApiKey: {
    context: withParams('id', ['params', {}]),
    middleware: wrap({
      before: [
        paramsFromClient(
          'detailed',
          'removed',
          'publicKey',
          'secretKey',
          'includeImagePath'
        ),
        softDelete(),
        generateApiKey(),
        keep()
      ],
      after: [
        ...afterAll,
        populateAccountTypes(),
        callInterface('onGenerateApiKey')
      ]
    })
  },
  setNewFlag: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [
        softDelete(),
        validate(setNewFlagSchema),
        keep('isNew'),
        snakeCase()
      ],
      after: [...afterAll, populateAccountTypes()]
    })
  },
  refresh: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [
        softDelete(),
        iff(ctx => _.has(ctx.data, 'lastSignin'), setNow('lastSignin')),
        iff(ctx => _.has(ctx.data, 'lastInboxCheck'), setNow('lastInboxCheck')),
        iff(ctx => _.has(ctx.data, 'lastNotified'), setNow('lastNotified')),
        keep('lastSignin', 'lastInboxCheck', 'lastNotified'),
        snakeCase()
      ],
      after: [...afterAll, populateAccountTypes()]
    })
  }
};
