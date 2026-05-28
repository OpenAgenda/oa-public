import _ from 'lodash';
import feathersKnex from 'feathers-knex';
import hooksCommon from 'feathers-hooks-common';
import { hooks, withParams } from '@feathersjs/hooks';
import { BadRequest, NotFound } from '@openagenda/verror';
import schema from '@openagenda/validators/schema/index';
import validators from '@openagenda/validators';
import * as crypto from '../utils/crypto.js';
import { wrap } from '../utils/wrappers.js';

import {
  callInterface,
  camelCase,
  camelCaseQuery,
  checkUnicity,
  coerce,
  detailedParamHook,
  error as errorHook,
  formatStore,
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
  profileImage,
  removedParamHook,
  searchKeyword,
  setInStore,
  snakeCase,
  snakeCaseQuery,
  softDelete as _softDelete,
  stashBefore,
  validate,
  validateCreate,
} from '../hooks/index.js';

import patchSchema from './schemas/patch.js';
import setNewFlagSchema from './schemas/setNewFlag.js';
import coerceSchema from './schemas/coerce.js';
import Tokens from './Tokens.js';

const { Service } = feathersKnex;
const { iff, keep, discardQuery, paramsFromClient, setNow } = hooksCommon;

schema.register({
  text: validators.text,
  email: validators.email,
  boolean: validators.boolean,
  pass: validators.pass,
});

function softDelete() {
  return _softDelete('isRemoved', {
    provider: undefined,
    detailed: true,
    includeImagePath: false,
  });
}

const afterAll = [
  camelCase(),
  camelCaseQuery(),
  keepFields(),
  includeImagePathParamHook(),
  coerce(coerceSchema),
  parseStore(),
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
        '$search',
        // '$disableSoftDelete',
        // '$disableStashBefore'
      ]),
    };

    const { gm } = config.Files;

    super(config);

    this.config = config;

    this.upload = config.Files({
      key: 'image',
      variants: [
        {
          getFilename: (info, context) =>
            `user.profile.${context.uid}.${crypto.randomUUID().replace(/-/g, '')}.jpg`,
          transform: (info, context) => {
            context.providerParams.ContentType = 'image/jpeg';

            return gm(info.stream, context.originalname)
              .autoOrient()
              .noProfile()
              .resize(600, 600, '^')
              .gravity('Center')
              .crop(600, 600)
              .stream('jpg');
          },
        },
        {
          getFilename: (info, context) =>
            `user.profile.${context.uid}_o.${crypto.randomUUID().replace(/-/g, '')}.jpg`,
          transform: (info, context) => {
            context.providerParams.ContentType = 'image/jpeg';

            return gm(info.stream, context.originalname)
              .autoOrient()
              .noProfile()
              .stream('jpg');
          },
        },
        {
          getFilename: (info, context) =>
            `user.profile.${context.uid}_sm.${crypto.randomUUID().replace(/-/g, '')}.jpg`,
          transform: (info, context) => {
            context.providerParams.ContentType = 'image/jpeg';

            return gm(info.stream, context.originalname)
              .autoOrient()
              .noProfile()
              .resize(300, 300, '^')
              .gravity('Center')
              .crop(300, 300)
              .stream('jpg');
          },
        },
      ],
    });
  }

  async findOne(params = {}) {
    params.query = params.query || {};
    params.query.$limit = 1;

    const result = await this.find(params);

    const data = result.data || result;

    return Array.isArray(data) ? data[0] : data;
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

  async requestUnlinkFacebook(uid, data, params = {}) {
    await this._patch(uid, data);

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
      throw new BadRequest('Query is needed for `verifyPassword`');
    }

    const user = await this.findOne({ query: params.query, internal: true });

    if (!user) {
      throw new NotFound('User not found for `verifyPassword`');
    }

    const password = typeof data === 'string' ? data : data.password;

    // Users created (or password-reset) via better-auth no longer have a
    // legacy `user.password` value — BA owns `account.password` instead.
    // When the legacy column is empty, delegate to the BA-backed verifier
    // wired by the consumer (see `cibul-node/services/users/index.js` →
    // `interfaces.verifyPassword`). This restores password challenges
    // (delete agenda, change email, delete account, change password) for
    // BA-only users without breaking legacy SHA-256/SHA-1 accounts that
    // still hold their hash here.
    if (typeof user.password !== 'string' || user.password.length === 0) {
      const externalVerify = this.config.interfaces?.verifyPassword;
      if (typeof externalVerify === 'function') {
        return externalVerify(user, password);
      }
      return false;
    }

    if (user.password.length === 40) {
      // sha1 — legacy column. No in-place rehash here: better-auth's
      // verify accepts the `legacy-sha1` sentinel in `account.password`
      // and lazy-rehashes to argon2id on the next /sign-in/email (see
      // `@openagenda/auth` `hooks.after`). This codepath only runs for
      // non-BA password challenges (delete agenda, change email, …) and
      // those don't need to migrate the hash.
      return crypto.verifyPassword(user.password, password, user.salt, true);
    }

    return crypto.verifyPassword(user.password, password, user.salt);
  }

  async activate(uid, data = {}, options = {}) {
    const tokensSvc = await this.config.getTokensService();
    let user;

    const { ignoreToken = false } = options;

    if (uid) {
      user = await this.get(uid);

      if (!user) {
        throw new NotFound('User not found for `activate`');
      }
    }

    const token = !ignoreToken
      ? await tokensSvc.findOne({
        query: {
          token: data.token,
          ...user ? { userId: user.id } : {},
        },
      })
      : null;

    if (!token && !ignoreToken) {
      throw new NotFound('Token not found for `activate`');
    }

    if (!user) {
      user = await this.findOne({
        query: { id: token.userId },
      });

      if (!user) {
        throw new NotFound('User not found for `activate`');
      }
    }

    if (!user.isActivated) {
      user = await this.patch(
        user.uid,
        { isActivated: true },
        { internal: true },
      );
    }

    if (token) {
      await tokensSvc.remove(token.id);
    }

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
        searchKeyword(),
      ],
      after: [...afterAll, populateAccountTypes()],
    }),
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
        snakeCaseQuery(),
      ],
      after: [...afterAll, populateAccountTypes()],
    }),
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
          (context) => _.get(context.data, 'password'),
          hashPassword('data.password', 'data.salt'),
        ),
        setNow('createdAt', 'updatedAt'),
        callInterface('beforeCreate'),
        formatStore(),
        softDelete(),
        snakeCase(),
        snakeCaseQuery(),
      ],
      after: [
        ...afterAll,
        populateAccountTypes(),
        callInterface('onCreate'),
        iff(
          (context) => context.result && context.result.isActivated,
          callInterface('onActivation'),
        ),
      ],
    }),
  },
  update: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      after: [callInterface('onUpdate')],
    }),
  },
  patch: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [
        stashBefore('before', { internal: true, provider: undefined }),
        iff(
          (context) => context.params.internal !== true,
          (context) =>
            validate(_.pick(patchSchema, Object.keys(context.data)))(context),
          keep('fullName', 'culture', 'image'),
        ),
        profileImage(),
        setNow('updatedAt'),
        paramsFromClient('detailed', 'removed', 'includeImagePath'),
        softDelete(),
        formatStore(),
        snakeCase(),
        snakeCaseQuery(),
      ],
      after: [
        ...afterAll,
        populateAccountTypes(),
        callInterface('onPatch'),
        iff(
          (context) =>
            !context.params.before.isActivated && context.result.isActivated,
          callInterface('onActivation'),
        ),
      ],
    }),
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
        snakeCaseQuery(),
      ],
      after: [callInterface('onRemove')],
    }),
  },
  requestChangeEmail: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [
        stashBefore('before', { internal: true, provider: undefined }),
        softDelete(),
        validate({
          newEmail: { optional: false, type: 'email' },
        }),
        checkUnicity('email', 'data.newEmail'),
        generateToken('newEmailToken'),
        setInStore('newEmailToken', 'newEmailToken'),
        setInStore('newEmail', 'data.newEmail'),
        keep('store'),
        formatStore(),
      ],
      after: [...afterAll, populateAccountTypes()],
    }),
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
        keep(),
      ],
      after: [...afterAll],
    }),
  },
  requestUnlinkFacebook: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [
        stashBefore('before', { internal: true, provider: undefined }),
        softDelete(),
        validate({
          email: { optional: false, type: 'email' },
          password: { optional: false, type: 'text' },
        }),
        (context) => {
          if (!context.params.before.facebookUid) {
            throw new BadRequest('notFacebookAccount');
          }
        },
        iff(
          (context) => context.data.email !== context.params.before.email,
          checkUnicity('email', 'data.email'),
        ),
        setInStore('unlinkFacebookEmail', 'data.email'),
        hashPassword('data.password', 'params.before.salt'),
        setInStore('unlinkFacebookPasswordHash', 'data.password'),
        keep('store'),
        formatStore(),
      ],
      after: [...afterAll, populateAccountTypes()],
    }),
  },
  setNewFlag: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [
        softDelete(),
        validate(setNewFlagSchema),
        keep('isNew'),
        snakeCase(),
      ],
      after: [...afterAll, populateAccountTypes()],
    }),
  },
  refresh: {
    context: withParams('id', 'data', ['params', {}]),
    middleware: wrap({
      before: [
        softDelete(),
        iff((ctx) => _.has(ctx.data, 'lastSignin'), setNow('lastSignin')),
        iff(
          (ctx) => _.has(ctx.data, 'lastInboxCheck'),
          setNow('lastInboxCheck'),
        ),
        iff((ctx) => _.has(ctx.data, 'lastNotified'), setNow('lastNotified')),
        keep('lastSignin', 'lastInboxCheck', 'lastNotified'),
        snakeCase(),
      ],
      after: [...afterAll, populateAccountTypes()],
    }),
  },
});

Users.Tokens = Tokens;

export default Users;
export { Tokens };
