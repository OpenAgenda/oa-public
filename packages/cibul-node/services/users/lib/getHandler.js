'use strict';

const { HookContext } = require('@feathersjs/hooks');
const errors = require('@feathersjs/errors');
const { omit } = require('@feathersjs/commons')._;
const log = require('@openagenda/logs')('services/users/getHandler');

const statusCodes = {
  created: 201,
  noContent: 204,
  methodNotAllowed: 405,
};
const methodMap = {
  find: 'GET',
  get: 'GET',
  create: 'POST',
  update: 'PUT',
  patch: 'PATCH',
  remove: 'DELETE',
};

function getAllowedMethods(service, routes) {
  if (routes) {
    return routes
      .filter(({ method }) => typeof service[method] === 'function')
      .map(methodRoute => methodRoute.verb.toUpperCase())
      .filter((value, index, list) => list.indexOf(value) === index);
  }

  return Object.keys(methodMap)
    .filter(method => typeof service[method] === 'function')
    .map(method => methodMap[method])
    // Filter out duplicates
    .filter((value, index, list) => list.indexOf(value) === index);
}

function makeArgsGetter(argsOrder) {
  return (req, params) => argsOrder.map(argName => {
    switch (argName) {
      case 'id':
        return req.params.__feathersId || null;
      case 'data':
        return req.body;
      case 'params':
        return params;
      default:
        return null;
    }
  });
}

// A function that returns the middleware for a given method and service
// `getArgs` is a function that should return additional leading service arguments
module.exports = function getHandler(method, argsOrder) {
  return (service, routes = []) => {
    const getArgs = makeArgsGetter(argsOrder);
    const allowedMethods = routes.length ? getAllowedMethods(service, routes) : null;

    return (req, res, next) => {
      const { query } = req;
      const route = omit(req.params, '__feathersId');

      if (allowedMethods) {
        res.setHeader('Allow', allowedMethods.join(','));
      }

      // Check if the method exists on the service at all. Send 405 (Method not allowed) if not
      if (typeof service[method] !== 'function') {
        log.debug(`Method '${method}' not allowed on '${req.url}'`);
        res.status(statusCodes.methodNotAllowed);

        return next(new errors.MethodNotAllowed(`Method \`${method}\` is not supported by this endpoint.`));
      }

      // Grab the service parameters. Use req.feathers
      // and set the query to req.query merged with req.params
      const params = { query, route, ...req.feathers };

      Object.defineProperty(params, '__returnHook', {
        value: true,
      });

      const args = getArgs(req, params);

      log.debug(`REST handler calling \`${method}\` from \`${req.url}\``);

      const context = new HookContext({
        provider: 'rest',
        headers: req.headers,
      });

      service[method](...args, context)
        .then(hook => {
          const data = hook.dispatch !== undefined ? hook.dispatch : hook.result;

          res.data = data;
          res.hook = hook;

          if (hook.statusCode) {
            res.status(hook.statusCode);
          } else if (!data) {
            log.debug(`No content returned for '${req.url}'`);
            res.status(statusCodes.noContent);
          } else if (method === 'create') {
            res.status(statusCodes.created);
          }

          return next();
        })
        .catch(error => {
          log.debug('Error in handler:', error);
          res.hook = context;

          return next(error);
        });
    };
  };
};
