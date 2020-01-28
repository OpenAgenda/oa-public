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
const { beforeWrapper, afterWrapper } = require('../utils/wrappers');
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

      const { config } = context.self;

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

      const { config } = context.self;

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
  context => {
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
  find: [
    ...beforeWrapper(
      paramsFromClient('detailed', 'removed', 'includeImagePath'),
      removedParamHook(),
      detailedParamHook(),
      softDelete(),
      snakeCaseQuery(),
      searchByKey(),
      searchKeyword()
    ),
    ...afterWrapper(...afterAll, populateAccountTypes())
  ],
  get: [
    ...beforeWrapper(
      stashBefore('before', { internal: true, provider: undefined }),
      paramsFromClient('detailed', 'removed', 'includeImagePath'),
      removedParamHook(),
      detailedParamHook(),
      softDelete(),
      snakeCaseQuery()
    ),
    ...afterWrapper(...afterAll, populateAccountTypes())
  ],
  create: [
    ...beforeWrapper(
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
    ),
    ...afterWrapper(
      ...afterAll,
      populateAccountTypes(),
      async context => {
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
      },
      callInterface('onCreate'),
      iff(
        context => context.result && context.result.isActivated,
        callInterface('onActivation'),
        fastJoin(userResolvers)
      )
    )
  ],
  update: [],
  patch: [
    ...beforeWrapper(
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
    ),
    ...afterWrapper(
      ...afterAll,
      populateAccountTypes(),
      iff(
        context => !context.params.before.isActivated && context.result.isActivated,
        callInterface('onActivation'),
        fastJoin(userResolvers)
      )
    )
  ],
  remove: [
    ...beforeWrapper(
      stashBefore('before', { internal: true, provider: undefined }),
      paramsFromClient('detailed', 'removed', 'includeImagePath'),
      softDelete(),
      callInterface('beforeRemove'),
      snakeCase(),
      snakeCaseQuery()
    ),
    ...afterWrapper()
  ],
  setImageProfile: [...beforeWrapper(softDelete()), ...afterWrapper()],
  clearImageProfile: [...beforeWrapper(softDelete()), ...afterWrapper()],
  requestChangeEmail: [
    ...beforeWrapper(
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
    ),
    ...afterWrapper(...afterAll, populateAccountTypes())
  ],
  confirmChangeEmail: [
    ...beforeWrapper(
      stashBefore('before', { internal: true, provider: undefined }),
      softDelete(),
      isValidToken('params.before.store.newEmailToken', 'params.query.token'),
      checkUnicity('email', 'params.before.store.newEmail'),
      // changeEmailFromStore(),
      discardQuery('token'),
      keep()
    ),
    ...afterWrapper(...afterAll)
  ],
  changePassword: [
    ...beforeWrapper(
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
    ),
    ...afterWrapper(...afterAll, populateAccountTypes())
  ],
  generateApiKey: [
    ...beforeWrapper(
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
    ),
    ...afterWrapper(
      ...afterAll,
      populateAccountTypes(),
      callInterface('onGenerateApiKey')
    )
  ],
  setNewFlag: [
    ...beforeWrapper(
      softDelete(),
      validate({
        isNew: {
          optional: false,
          type: 'boolean'
        }
      }),
      keep('isNew'),
      snakeCase()
    ),
    ...afterWrapper(...afterAll, populateAccountTypes())
  ],
  refresh: [
    ...beforeWrapper(
      softDelete(),
      iff(dataExists('lastSignin'), setNow('lastSignin')),
      iff(dataExists('lastInboxCheck'), setNow('lastInboxCheck')),
      iff(dataExists('lastNotified'), setNow('lastNotified')),
      keep('lastSignin', 'lastInboxCheck', 'lastNotified'),
      snakeCase()
    ),
    ...afterWrapper(...afterAll, populateAccountTypes())
  ]
};
