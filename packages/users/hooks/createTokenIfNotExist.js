'use strict';

const _ = require('lodash');

module.exports = () => async context => {
  if (!context.result && context.params.createIfNotExist) {
    context.result = await context.self.create(
      _.pick(context.params.query, 'email', 'type', 'userId'),
      _.pick(context.params, 'user', 'optionals')
    );
  }
};
