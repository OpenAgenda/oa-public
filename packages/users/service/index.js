'use strict';

const { promisify } = require('util');
const _ = require('lodash');
const { Service } = require('feathers-knex');
const {
  iff,
  keep,
  discardQuery,
  fastJoin,
  paramsFromClient,
  setNow,
  isProvider
} = require('feathers-hooks-common');
const { hooks, withParams } = require('@feathersjs/hooks');
const errors = require('@feathersjs/errors');
const schema = require('@openagenda/validators/schema');
const validators = require('@openagenda/validators');
const imageFiles = require('@openagenda/image-files');
const crypto = require('../utils/crypto');
const { wrap } = require('../utils/wrappers');
const {
  callInterface,
  camelCase,
  camelCaseQuery,
  checkUnicity,
  coerce,
  compareFields,
  createActivationToken,
  detailedParamHook,
  error: errorHook,
  formatStore,
  generateApiKey,
  generateToken,
  generateHash,
  generateUid,
  generateUniqueToken,
  hashPassword,
  includeImagePathParamHook,
  isValidToken,
  keepFields,
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
  validateCreate,
  verifyPassword
} = require('../hooks');
const resolvers = require('./resolvers');
const patchSchema = require('./schemas/patch');
const requestChangeEmailSchema = require('./schemas/requestChangeEmail');
const changePasswordSchema = require('./schemas/changePassword');
const setNewFlagSchema = require('./schemas/setNewFlag');
const coerceSchema = require('./schemas/coerce');
const Tokens = require('./Tokens');

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

const afterAll = [
  camelCase(),
  camelCaseQuery(),
  keepFields(),
  includeImagePathParamHook(),
  coerce(coerceSchema),
  fastJoin({ joins: resolvers }),
  parseStore()
];

class Users extends Service {
  constructor(options) {
    const { whitelist = [] } = options;

    const config = {
      id: 'uid',
      ...options,
      whitelist: whitelist.concat([
        '$like',
        '$notlike',
        '$ilike',
        '$and',
        '$search'
        // '$disableSoftDelete',
        // '$disableStashBefore'
      ])
    };

    super(config);

    this.config = config;
  }

  static getImageFormats(name, includeExtension = false) {
    const extension = includeExtension ? `.${includeExtension}` : '';

    return [
      {
        name: name + extension,
        format: { width: 600 }
      },
      {
        name: `${name}_o${extension}`
      },
      {
        name: `${name}_sm${extension}`,
        format: { width: 300 }
      }
    ];
  }

  async findOne(params = {}) {
    params.query = params.query || {};
    params.query.$limit = 1;

    const result = await this.find(params);

    const data = result.data || result;

    return Array.isArray(data) ? data[0] : data;
  }

  async setImageProfile(uid, { path, url }, params = {}) {
    const result = await imageFiles.load({
      path,
      url,
      formats: Users.getImageFormats(`user.profile.${uid}`)
    });

    await this._patch(
      uid,
      {
        image: result.uploadedPaths[0].split('/').pop()
      },
      { internal: true }
    );

    result.user = await this.get(uid, params);

    return result;
  }

  async clearImageProfile(uid) {
    const user = await this.get(uid);

    const extension = user.image.split('.').pop();
    const paths = Users.getImageFormats(
      `user.profile.${user.uid}`,
      extension
    ).map(v => v.name);

    await promisify(imageFiles.clear)(paths);

    await this._patch(user.uid, { image: null });

    return { success: true };
  }

  async requestChangeEmail(uid, data, params = {}) {
    await this._patch(uid, data);

    return this.get(uid, params);
  }

  async confirmChangeEmail(uid, params = {}) {
    const data = {};

    data.email = params.before.store.newEmail;
    data.store = params.before.store;

    delete data.store.newEmail;
    delete data.store.newEmailToken;

    data.store = JSON.stringify(data.store || {});

    await this._patch(uid, data);

    return { email: data.email };
  }

  async changePassword(uid, data, params = {}) {
    await this._patch(uid, data);

    return this.get(uid, params);
  }

  generateApiKey(uid, params = {}) {
    return this.get(uid, params);
  }

  async setNewFlag(uid, data, params = {}) {
    await this._patch(uid, data);

    return this.get(uid, params);
  }

  async refresh(uid, data, params = {}) {
    await this._patch(uid, data);

    return this.get(uid, params);
  }

  async verifyPassword(data, params = {}) {
    if (!params.query) {
      throw new errors.BadRequest('Query is needed for `verifyPassword`');
    }

    const user = await this.findOne({ query: params.query, internal: true });

    if (!user) {
      throw new errors.NotFound('User not found for `verifyPassword`');
    }

    return crypto.verifyPassword(
      user.password,
      typeof data === 'string' ? data : data.password,
      user.salt
    );
  }

  async activate(uid, data) {
    const tokensSvc = await this.config.getTokensService();
    let user;

    if (uid) {
      user = await this.get(uid);

      if (!user) {
        throw new errors.NotFound('User not found for `activate`');
      }
    }

    const token = await tokensSvc.findOne({
      query: {
        token: data.token,
        ...(user ? { userId: user.id } : {})
      }
    });

    if (!token) {
      throw new errors.NotFound('Token not found for `activate`');
    }

    if (!user) {
      user = await this.findOne({
        query: { id: token.userId }
      });

      if (!user) {
        throw new errors.NotFound('User not found for `activate`');
      }
    }

    if (!user.isActivated) {
      user = await this.patch(
        user.uid,
        { isActivated: true },
        { internal: true }
      );
    }

    await tokensSvc.remove(token.id);

    return user;
  }
}

hooks(Users.prototype, [errorHook()]);

hooks(Users.prototype, {
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
});

module.exports = Users;
module.exports.Tokens = Tokens;
