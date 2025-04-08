import _ from 'lodash';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import service from './service/index.js';

const log = logs('keys/middleware');
const cbify = (fn) => (req, res, next) =>
  new Promise((rs) => fn(req, res, rs)).then(next, next);

function create(options) {
  const { namespaces } = _.merge(
    {
      namespaces: {
        identifiers: 'identifiers',
        data: 'body',
        result: 'result',
      },
    },
    options,
  );

  return cbify(async (req, res, next) => {
    try {
      const result = await service(_.get(req, namespaces.identifiers)).create(
        _.get(req, namespaces.data),
      );

      _.set(req, namespaces.result, result);
    } catch (e) {
      if (e.name === 'ValidationError') {
        return next({
          code: 400,
          json: { errors: VError.info(e).errors },
        });
      }

      log('error', e);

      return next(e);
    }

    return next();
  });
}

function get(options) {
  const { namespaces } = _.merge(
    {
      namespaces: {
        identifiers: 'identifiers',
        result: 'result',
      },
    },
    options,
  );

  return cbify(async (req, res, next) => {
    try {
      const result = await service(_.get(req, namespaces.identifiers)).get();

      _.set(req, namespaces.result, result);
    } catch (e) {
      if (e.name === 'ValidationError') {
        return next({
          code: 400,
          json: { errors: VError.info(e).errors },
        });
      }

      log('error', e);

      return next(e);
    }

    return next();
  });
}

function list(options) {
  const { namespaces } = _.merge(
    {
      namespaces: {
        identifiers: 'identifiers',
        offset: 'query.offset',
        limit: 'query.limit',
        options: 'options',
        result: 'result',
      },
    },
    options,
  );

  return cbify(async (req, res, next) => {
    try {
      const result = await service(_.get(req, namespaces.identifiers)).list(
        _.get(req, namespaces.offset, 0),
        _.get(req, namespaces.limit, 20),
        _.get(req, namespaces.options),
      );

      _.set(req, namespaces.result, result);
    } catch (e) {
      if (e.name === 'ValidationError') {
        return next({
          code: 400,
          json: { errors: VError.info(e).errors },
        });
      }

      log('error', e);

      return next(e);
    }

    return next();
  });
}

function update(options) {
  const { namespaces } = _.merge(
    {
      namespaces: {
        identifiers: 'identifiers',
        data: 'body',
        result: 'result',
      },
    },
    options,
  );

  return cbify(async (req, res, next) => {
    try {
      const result = await service(_.get(req, namespaces.identifiers)).update(
        _.get(req, namespaces.data),
      );

      _.set(req, namespaces.result, result);
    } catch (e) {
      if (e.name === 'ValidationError') {
        return next({
          code: 400,
          json: { errors: VError.info(e).errors },
        });
      }

      log('error', e);

      return next(e);
    }

    return next();
  });
}

function remove(options) {
  const { namespaces } = _.merge(
    {
      namespaces: {
        identifiers: 'identifiers',
        result: 'result',
      },
    },
    options,
  );

  return cbify(async (req, res, next) => {
    try {
      const result = await service(_.get(req, namespaces.identifiers)).remove();

      _.set(req, namespaces.result, result);
    } catch (e) {
      if (e.name === 'ValidationError') {
        return next({
          code: 400,
          json: { errors: VError.info(e).errors },
        });
      }

      log('error', e);

      return next(e);
    }

    return next();
  });
}

export { create, get, list, update, remove };
