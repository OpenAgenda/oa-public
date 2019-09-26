'use strict';

const { inspect } = require('util');
const debug = require('debug');
const _ = require('lodash');
const VError = require('verror');
const {
  iff,
  keep,
  discardQuery,
  fastJoin,
  paramsFromClient,
  setNow,
  isProvider
} = require('feathers-hooks-common');
const log = require('@openagenda/logs')('users/hooks');
const schema = require('@openagenda/validators/schema');
const validators = require('@openagenda/validators');
const {
  callInterface,
  camelCase,
  camelCaseQuery,
  checkUnicity,
  coerce,
  compareFields,
  dataExists,
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
const fields = require('./fields');

schema.register({
  text: validators.text,
  email: validators.email,
  boolean: validators.boolean,
  pass: validators.pass
});

const creationSchema = {
  fullName: {
    type: 'text',
    min: 2,
    optional: false
  },
  username: {
    type: 'text'
  },
  culture: {
    type: 'text',
    min: 2,
    max: 2,
    default: 'fr'
  },
  email: {
    type: 'email',
    optional: false
  },
  password: {
    type: 'text',
    min: 4,
    optional: false
  },
  twitterId: {
    type: 'text'
  },
  googleId: {
    type: 'text'
  },
  facebookUid: {
    type: 'text'
  }
};

const softDelete = () => _softDelete('isRemoved', {
  provider: undefined,
  detailed: true,
  includeImagePath: false
});

const userResolvers = {
  joins: {
    apiKey: () => async (user, context) => {
      if (!user || !user.uid) {
        return;
      }

      const { config } = context.service;

      const result = await config.interfaces.keys.get({
        type: 'userPublic',
        identifier: user.uid
      });

      user.apiKey = result ? result.key : null;
    },
    apiSecret: () => async (user, context) => {
      if (!user || !user.uid) {
        return;
      }

      const { config } = context.service;

      const result = await config.interfaces.keys.get({
        type: 'userPrivate',
        identifier: user.uid
      });

      user.apiSecret = result ? result.key : null;
    }
  }
};

const afterAll = [
  camelCase(),
  camelCaseQuery(),
  populateAccountTypes(),
  context => {
    if (context.result === null || context.params.internal === true) {
      return context;
    }

    return keep(
      ...(context.params.detailed
        ? [
          ...fields.basic,
          ...fields.detailed,
          'hasSocialAccount',
          'hasLocalAccount'
        ]
        : [...fields.basic, 'hasSocialAccount', 'hasLocalAccount'])
    )(context);
  },
  includeImagePathParamHook(),
  coerce({
    isActivated: {
      type: 'boolean',
      optional: true
    },
    isRemoved: {
      type: 'boolean',
      optional: true
    },
    isBasic: {
      type: 'boolean',
      optional: true
    },
    isNew: {
      type: 'boolean',
      optional: true
    },
    apiKey: {
      type: 'text',
      optional: true
    },
    apiSecret: {
      type: 'text',
      optional: true
    }
  }),
  fastJoin(userResolvers),
  parseStore()
];

module.exports = {
  before: {
    all: [],
    find: [
      paramsFromClient('detailed', 'removed', 'includeImagePath'),
      removedParamHook(),
      detailedParamHook(),
      softDelete(),
      snakeCaseQuery(),
      searchByKey(),
      searchKeyword()
    ],
    get: [
      stashBefore('before', { internal: true, provider: undefined }),
      paramsFromClient('detailed', 'removed', 'includeImagePath'),
      removedParamHook(),
      detailedParamHook(),
      softDelete(),
      snakeCaseQuery()
    ],
    create: [
      paramsFromClient('detailed', 'removed', 'includeImagePath'),
      context => validate({
        ...creationSchema,
        // Allow server to create an activated user
        ...(isProvider('server')(context)
          ? {
            isActivated: {
              type: 'boolean',
              default: false
            }
          }
          : {}),
        // Allow password to be optional for a twitter registration
        ...(['twitterId', 'googleId', 'facebookUid'].some(key => _.get(context.data, key))
          ? {
            password: {
              type: 'text',
              min: 4,
              optional: true
            }
          }
          : {})
      })(context),
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
    patch: [
      stashBefore('before', { internal: true, provider: undefined }),
      iff(
        context => context.params.internal !== true,
        context => validate(
          _.pick(
            {
              fullName: {
                optional: true,
                type: 'text'
              },
              culture: {
                optional: true,
                type: 'text',
                min: 2,
                max: 2
              }
            },
            Object.keys(context.data)
          )
        )(context),
        keep('fullName', 'culture')
      ),
      setNow('updatedAt'),
      paramsFromClient('detailed', 'removed', 'includeImagePath'),
      softDelete(),
      formatStore(),
      snakeCase(),
      snakeCaseQuery()
    ],
    remove: [
      stashBefore('before', { internal: true, provider: undefined }),
      paramsFromClient('detailed', 'removed', 'includeImagePath'),
      softDelete(),
      callInterface('beforeRemove'),
      snakeCase(),
      snakeCaseQuery()
    ],
    setImageProfile: [softDelete()],
    clearImageProfile: [softDelete()],
    requestChangeEmail: [
      stashBefore('before', { internal: true, provider: undefined }),
      softDelete(),
      validate({
        newEmail: {
          optional: false,
          type: 'email'
        },
        password: {
          type: 'text'
        }
      }),
      checkUnicity('email', 'data.newEmail'),
      iff(isProvider('external'), verifyPassword()),
      generateToken('newEmailToken'),
      setInStore('newEmailToken', 'newEmailToken'),
      setInStore('newEmail', 'data.newEmail'),
      keep('store'),
      formatStore()
    ],
    confirmChangeEmail: [
      stashBefore('before', { internal: true, provider: undefined }),
      softDelete(),
      isValidToken('params.before.store.newEmailToken', 'params.query.token'),
      checkUnicity('email', 'params.before.store.newEmail'),
      // changeEmailFromStore(),
      discardQuery('token'),
      keep()
    ],
    changePassword: [
      stashBefore('before', { internal: true, provider: undefined }),
      softDelete(),
      validate({
        password: {
          optional: false,
          type: 'text',
          min: 4
        },
        confirmation: {
          type: 'text'
        },
        oldPassword: {
          type: 'text'
        }
      }),
      iff(
        isProvider('external'),
        verifyPassword('oldPassword'),
        compareFields('password', 'confirmation')
      ),
      hashPassword('data.password', 'params.before.salt'),
      keep('password')
    ],
    generateApiKey: [
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
    setNewFlag: [
      softDelete(),
      validate({
        isNew: {
          optional: false,
          type: 'boolean'
        }
      }),
      keep('isNew'),
      snakeCase()
    ],
    refresh: [
      softDelete(),
      iff(dataExists('lastSignin'), setNow('lastSignin')),
      iff(dataExists('lastInboxCheck'), setNow('lastInboxCheck')),
      iff(dataExists('lastNotified'), setNow('lastNotified')),
      keep('lastSignin', 'lastInboxCheck', 'lastNotified'),
      snakeCase()
    ]
  },

  after: {
    all: [],
    find: afterAll,
    get: afterAll,
    create: [
      ...afterAll,
      async context => {
        if (context.result && !context.result.isActivated) {
          const tokensSvc = context.service.tokens;

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
      },
      callInterface('onCreate'),
      iff(
        context => context.result && context.result.isActivated,
        callInterface('onActivation'),
        fastJoin(userResolvers)
      )
    ],
    patch: [
      ...afterAll,
      iff(
        context => !context.params.before.isActivated && context.result.isActivated,
        callInterface('onActivation'),
        fastJoin(userResolvers)
      )
    ],
    remove: [],
    setImageProfile: [],
    clearImageProfile: [],
    requestChangeEmail: afterAll,
    confirmChangeEmail: afterAll,
    changePassword: afterAll,
    generateApiKey: [...afterAll, callInterface('onGenerateApiKey')],
    setNewFlag: afterAll,
    refresh: afterAll
  },

  error(context) {
    // Avoid soft delete error
    if (
      _.get(context, 'error.name') === 'NotFound'
      && context.error.message.includes('No record found')
    ) {
      context.error = null;
      context.result = null;
      return context;
    }

    if (!(_.get(context, 'error.name') === 'NotFound')) {
      const errorStack = context.error instanceof Error
        ? `\n${VError.fullStack(context.error)}`
        : '';

      log.error(
        `Error in service method '${context.method}'${errorStack}\n`,
        inspect(_.omit(context.error, ['hook.app', 'hook.service']), {
          colors: debug.useColors()
        })
      );
    }
  }
};
