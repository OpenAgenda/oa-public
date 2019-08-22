'use strict';

const _ = require('lodash');
const { Service } = require('feathers-knex');

class Tokens extends Service {
  constructor(options) {
    const config = { id: 'id', ...options };

    super(config);

    this.config = config;
  }

  async findOne(params = {}) {
    params.query = params.query || {};
    params.query.$limit = 1;

    const result = await this.find(params);
    const data = result.data || result;
    let token = Array.isArray(data) ? data[0] : data;

    if (!token && params.createIfNotExist) {
      token = await this.create(
        _.pick(params.query, 'email', 'type', 'userId'),
        _.pick(params, 'user', 'optionals')
      );
    }

    return token;
  }
}

module.exports = Tokens;
