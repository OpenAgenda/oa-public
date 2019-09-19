'use strict';

const _ = require('lodash');
const errors = require('@feathersjs/errors');

module.exports = function isValidToken(localKey, foreignKey) {
  return context => {
    const localValue = _.get(context, localKey);
    const foreignValue = _.get(context, foreignKey);

    if (typeof foreignValue === 'undefined' || localValue !== foreignValue) {
      throw new errors.BadRequest('Bad token');
    }
  };
};
