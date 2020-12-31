'use strict';

const events = require('@openagenda/events');
const eventsV2 = require('@openagenda/events/2.0.0');
const onCreate = require('./onCreate');
const onUpdate = require('./onUpdate');
const beforeRemove = require('./beforeRemove');
const onRemove = require('./onRemove');
const getOriginAgendas = require('./getOriginAgendas');
const getLocations = require('./getLocations');

module.exports = {
  init
}

function init(config, services) {
  const {
    knex
  } = services;

  events.init({
    knex,
    mysql: config.db,
    redis: config.redis,
    logger: config.getLogConfig('svc', 'events'),
    schemas: {
      event: config.schemas.eventService
    },
    image: {
      base: config.aws.imageBucketPath,
      default: config.aws.defaultImagePath
    },
    legacy: {
      mysql: config.db,
      schemas: config.schemas
    },
    Files: services.files,
    interfaces: {
      onCreate: onCreate.bind(null, services),
      onUpdate: onUpdate.bind(null, services),
      beforeRemove: beforeRemove.bind(null, services),
      onRemove: onRemove.bind(null, services),
      getOriginAgendas,
      getLocations: getLocations.callback.bind(null, services)
    }
  });

  const service = Object.assign(events, {
    upload: events.getConfig().upload
  });

  service.v2 = eventsV2({
    knex,
    imagePath: config.aws.imageBucketPath,
    Files: services.files,
    logger: config.getLogConfig('svc', 'events.v2'),
    interfaces: {
      onCreate: onCreate.bind(null, services),
      onUpdate: onUpdate.bind(null, services),
      beforeRemove: beforeRemove.bind(null, services),
      onRemove: onRemove.bind(null, services),
      getOriginAgendas,
      getLocations: getLocations.promise.bind(null, services)
    }
  });

  Object.assign(
    module.exports,
    service
 );

  return service;
}
