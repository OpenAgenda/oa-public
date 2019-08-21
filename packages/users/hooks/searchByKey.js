'use strict';

module.exports = function searchByKey() {
  return async context => {
    const { config } = context.service;

    context.params.query = context.params.query || {};

    const { key } = context.params.query;

    if (!key) {
      return context;
    }
    delete context.params.query.key;

    let result = await config.interfaces.keys.get({ type: 'userPublic', key });

    if (result && result.key) {
      context.params.query.uid = result.identifier;
    } else {
      result = await config.interfaces.keys.get({ type: 'userPrivate', key });

      if (result && result.key) {
        context.params.query.uid = result.identifier;
      } else {
        context.result = null;
      }
    }

    return context;
  };
};
