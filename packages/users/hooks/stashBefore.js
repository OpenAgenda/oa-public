'use strict';

const errors = require('@feathersjs/errors');
const { checkContext } = require('feathers-hooks-common');

module.exports = function stashBefore(prop, additionalParams = {}) {
  const beforeField = prop || 'before';

  return context => {
    checkContext(
      context,
      'before',
      ['get', 'update', 'patch', 'remove'],
      'stashBefore'
    );

    if (context.params.query && context.params.query.$disableStashBefore) {
      delete context.params.query.$disableStashBefore;
      return context;
    }

    if (
      (context.id === null || context.id === undefined)
      && !context.params.query
    ) {
      throw new errors.BadRequest('Id is required. (stashBefore)');
    }

    const params = {
      ...(context.method === 'get'
        ? context.params
        : {
          provider: context.params.provider,
          authenticated: context.params.authenticated,
          user: context.params.user
        }),
      ...additionalParams
    };

    params.query = params.query || {};
    params.query.$disableStashBefore = true;

    return context.service.get(context.id, params).then(data => {
      delete params.query.$disableStashBefore;

      context.params[beforeField] = JSON.parse(JSON.stringify(data));
      return context;
    });
  };
};
