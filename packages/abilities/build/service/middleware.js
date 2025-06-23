import _isObject from "lodash/isObject.js";
import _isString from "lodash/isString.js";
import _toNumber from "lodash/toNumber.js";
import _get from "lodash/get.js";
import _merge from "lodash/merge.js";
import "core-js/modules/es.promise.js";
import _Promise from "@babel/runtime-corejs3/core-js/promise";
// import service from './index';

function wrap(fn) {
  return (req, res, next) => _Promise.resolve(fn(req, res, next)).catch(next);
}
export function getFormIndex(service, options) {
  const {
    namespaces
  } = _merge({
    namespaces: {
      entityName: 'query.entityName',
      identifier: 'query.identifier'
    }
  }, options);
  return wrap(async (req, res) => {
    const entityName = _get(req, namespaces.entityName, null);
    const identifier = _toNumber(_get(req, namespaces.identifier, null));
    if (!_isString(entityName)) {
      res.status(400);
      throw new Error('entityName should be a string');
    }
    if (!identifier) {
      res.status(400);
      throw new Error('identifier should be a number');
    }
    const ability = await service.get(entityName, identifier);
    const formIndex = await ability.getFormIndex();
    res.send(formIndex);
  });
}
export function updateFormIndex(service, options) {
  const {
    namespaces
  } = _merge({
    namespaces: {
      entityName: 'query.entityName',
      identifier: 'query.identifier',
      data: 'body'
    }
  }, options);
  return wrap(async (req, res) => {
    const entityName = _get(req, namespaces.entityName, null);
    const identifier = _toNumber(_get(req, namespaces.identifier, null));
    const data = _get(req, namespaces.data, null);
    if (!_isString(entityName)) {
      res.status(400);
      throw new Error('entityName should be a string');
    }
    if (!identifier) {
      res.status(400);
      throw new Error('identifier should be a number');
    }
    if (!_isObject(data)) {
      res.status(400);
      throw new Error('data should be an object');
    }
    const ability = await service.get(entityName, identifier);
    const formIndex = await ability.updateFormIndex(data);
    res.send(formIndex);
  });
}
//# sourceMappingURL=middleware.js.map