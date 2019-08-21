'use strict';

const { promisify } = require('util');
const { Service } = require('feathers-knex');
const { httpMethod } = require('@feathersjs/express/rest');
const errors = require('@feathersjs/errors');
const imageFiles = require('@openagenda/image-files');
const crypto = require('../utils/crypto');
const hooks = require('../service/hooks');
const Tokens = require('../tokens/Service');
const tokensHooks = require('../tokens/hooks');

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

    // define methods for activate hooks
    this.methods = {
      setImageProfile: ['id', 'data', 'params'],
      clearImageProfile: ['id', 'params'],
      requestChangeEmail: ['id', 'data', 'params'],
      confirmChangeEmail: ['id', 'params'],
      changePassword: ['id', 'data', 'params'],
      generateApiKey: ['id', 'params'],
      setNewFlag: ['id', 'data', 'params'],
      refresh: ['id', 'data', 'params']
    };

    // expose methods with express
    this.setImageProfile = httpMethod('POST', ':__feathersId/setImageProfile')(
      this.setImageProfile
    );
    this.clearImageProfile = httpMethod(
      'POST',
      ':__feathersId/clearImageProfile'
    )(this.clearImageProfile);
    this.requestChangeEmail = httpMethod(
      'PATCH',
      ':__feathersId/requestChangeEmail'
    )(this.requestChangeEmail);
    this.confirmChangeEmail = httpMethod(
      'GET',
      ':__feathersId/confirmChangeEmail'
    )(this.confirmChangeEmail);
    this.changePassword = httpMethod('PATCH', ':__feathersId/changePassword')(
      this.changePassword
    );
    this.generateApiKey = httpMethod('GET', ':__feathersId/generateApiKey')(
      this.generateApiKey
    );
    this.setNewFlag = httpMethod('PATCH', ':__feathersId/setNewFlag')(
      this.setNewFlag
    );
    this.refresh = httpMethod('PATCH', ':__feathersId/refresh')(this.refresh);
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

  setup(app, path) {
    this.app = app;
    this.path = path;

    // register subjacent service tokens
    app.use(
      `${path}/tokens`,
      new Tokens({
        Model: this.config.Model,
        name: this.config.schemas.userToken,
        id: 'id',
        paginate: this.config.paginate,
        interfaces: this.config.interfaces
      })
    );

    this.tokens = app.service(`${path}/tokens`);

    this.tokens.hooks(tokensHooks);
  }

  async findOne(params = {}) {
    params.query = params.query || {};
    params.query.$limit = 1;

    const result = await this.find(params);
    const data = result.data || result;

    return Array.isArray(data) ? data[ 0 ] : data;
  }

  async setImageProfile(uid, { path, url }, params = {}) {
    const result = await imageFiles.load({
      path,
      url,
      formats: this._getImageFormats(`user.profile.${uid}`)
    });

    await this._patch(
      uid,
      {
        image: result.uploadedPaths[ 0 ].split('/').pop()
      },
      { internal: true }
    );

    result.user = await this.get(uid, params);

    return result;
  }

  async clearImageProfile(uid) {
    const user = await this.get(uid);

    const extension = user.image.split('.').pop();
    const paths = this._getImageFormats(
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
    const tokensSvc = await this.tokens;
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
module.exports.hooks = hooks;
