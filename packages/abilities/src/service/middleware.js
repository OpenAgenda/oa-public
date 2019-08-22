import _ from 'lodash';
// import service from './index';

function wrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function getFormIndex(service, options) {
  const { namespaces } = _.merge(
    {
      namespaces: {
        entityName: 'query.entityName',
        identifier: 'query.identifier'
      }
    },
    options
  );

  return wrap(async (req, res) => {
    const entityName = _.get(req, namespaces.entityName, null);
    const identifier = _.toNumber(_.get(req, namespaces.identifier, null));

    if (!_.isString(entityName)) {
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
  const { namespaces } = _.merge(
    {
      namespaces: {
        entityName: 'query.entityName',
        identifier: 'query.identifier',
        data: 'body'
      }
    },
    options
  );

  return wrap(async (req, res) => {
    const entityName = _.get(req, namespaces.entityName, null);
    const identifier = _.toNumber(_.get(req, namespaces.identifier, null));
    const data = _.get(req, namespaces.data, null);

    if (!_.isString(entityName)) {
      res.status(400);
      throw new Error('entityName should be a string');
    }

    if (!identifier) {
      res.status(400);
      throw new Error('identifier should be a number');
    }

    if (!_.isObject(data)) {
      res.status(400);
      throw new Error('data should be an object');
    }

    const ability = await service.get(entityName, identifier);
    const formIndex = await ability.updateFormIndex(data);

    res.send(formIndex);
  });
}
