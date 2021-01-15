'use strict';

const Service = require('@openagenda/events');
const onCreate = require('./onCreate');
const onUpdate = require('./onUpdate');
const beforeRemove = require('./beforeRemove');
const onRemove = require('./onRemove');
const getOriginAgendas = require('./getOriginAgendas');
const getLocations = require('./getLocations');

module.exports.init = (config, services) => Service({
  knex: services.knex,
  imagePath: config.aws.imageBucketPath,
  defaultImage: config.aws.defaultImagePath,
  Files: services.files,
  logger: config.getLogConfig('svc', 'events'),
  interfaces: {
    onCreate: onCreate.bind(null, services),
    onUpdate: onUpdate.bind(null, services),
    beforeRemove: beforeRemove.bind(null, services),
    onRemove: onRemove.bind(null, services),
    getOriginAgendas,
    getLocations: getLocations.promise.bind(null, services)
  }
});
