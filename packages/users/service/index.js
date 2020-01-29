'use strict';

const { promisify } = require('util');
const { Service } = require('feathers-knex');
const { hooks, withParams } = require('@feathersjs/hooks');
const errors = require('@feathersjs/errors');
const imageFiles = require('@openagenda/image-files');
const Tokens = require('../tokens/Service');
const usersHooks = require('../service/hooks');
const tokensHooks = require('../tokens/hooks');
const crypto = require('../utils/crypto');
const { error: errorHook } = require('../hooks');

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

module.exports = Users;
module.exports.Tokens = Tokens;

hooks(Users.prototype, [errorHook()]);
hooks(Tokens.prototype, [errorHook()]);

hooks(Users.prototype, {
  find: {
    middleware: usersHooks.find,
    context: withParams(['params', {}])
  },
  get: {
    middleware: usersHooks.get,
    context: withParams('id', ['params', {}])
  },
  create: {
    middleware: usersHooks.create,
    context: withParams('data', ['params', {}])
  },
  update: {
    middleware: usersHooks.update,
    context: withParams('id', 'data', ['params', {}])
  },
  patch: {
    middleware: usersHooks.patch,
    context: withParams('id', 'data', ['params', {}])
  },
  remove: {
    middleware: usersHooks.remove,
    context: withParams('id', ['params', {}])
  },
  setImageProfile: {
    middleware: usersHooks.setImageProfile,
    context: withParams('id', 'data', ['params', {}])
  },
  clearImageProfile: {
    middleware: usersHooks.clearImageProfile,
    context: withParams('id', ['params', {}])
  },
  requestChangeEmail: {
    middleware: usersHooks.requestChangeEmail,
    context: withParams('id', 'data', ['params', {}])
  },
  confirmChangeEmail: {
    middleware: usersHooks.confirmChangeEmail,
    context: withParams('id', ['params', {}])
  },
  changePassword: {
    middleware: usersHooks.changePassword,
    context: withParams('id', 'data', ['params', {}])
  },
  generateApiKey: {
    middleware: usersHooks.generateApiKey,
    context: withParams('id', ['params', {}])
  },
  setNewFlag: {
    middleware: usersHooks.setNewFlag,
    context: withParams('id', 'data', ['params', {}])
  },
  refresh: {
    middleware: usersHooks.refresh,
    context: withParams('id', 'data', ['params', {}])
  }
});

hooks(Tokens.prototype, {
  find: {
    middleware: tokensHooks.find,
    context: withParams(['params', {}])
  },
  get: {
    middleware: tokensHooks.get,
    context: withParams('id', ['params', {}])
  },
  create: {
    middleware: tokensHooks.create,
    context: withParams('data', ['params', {}])
  },
  update: {
    middleware: tokensHooks.update,
    context: withParams('id', 'data', ['params', {}])
  },
  patch: {
    middleware: tokensHooks.patch,
    context: withParams('id', 'data', ['params', {}])
  },
  remove: {
    middleware: tokensHooks.remove,
    context: withParams('id', ['params', {}])
  }
});
