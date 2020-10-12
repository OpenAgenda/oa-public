"use strict";

const events = require( '@openagenda/events' );
const onCreate = require( './onCreate' );
const onUpdate = require( './onUpdate' );
const beforeRemove = require( './beforeRemove' );
const onRemove = require( './onRemove' );
const getOriginAgendas = require( './getOriginAgendas' );

module.exports = {
  init
}


function init(config, services) {
  events.init( {
    knex: config.knex,
    mysql: config.db,
    redis: config.redis,
    logger: config.getLogConfig( 'svc', 'events' ),
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
      getLocations: (uids, options, cb) => services.agendaLocations
        .list({ uids }, { limit: uids.length }, {
          detailed: true,
          includeFields: [
            'uid',
            'slug',
            'name',
            'address',
            'city',
            'region',
            'department',
            'postalCode',
            'insee',
            'countryCode',
            'district',
            'latitude',
            'longitude',
            'updatedAt'
          ]
        }).then(cb.bind(null, null), cb)
    }
  } );

  const service = Object.assign(events, { upload: events.getConfig().upload });

  Object.assign(
    module.exports,
    service
  );

  return service;
}
