"use strict";

const { promisify } = require( 'util' );

const _ = require( 'lodash' );

const agendaLocations = require( '@openagenda/agenda-locations' );
const log = require( '@openagenda/logs' )( 'services/agendaLocations' );

const internalEventSvc = require( '../event' );

const agendas = require( '@openagenda/agendas' );

const getLocationSettings = require( './interfaces/getLocationSettings' );
const locationsWillMerge = require( './interfaces/locationsWillMerge' );
const locationWillRemove = require( './interfaces/locationWillRemove' );
const getAgendaSettings = require( './interfaces/getAgendaSettings' );
const getEventCounts = require( './interfaces/getEventCounts' );
const onUpdate = require( './interfaces/onUpdate' );
const onCreate = require( './interfaces/onCreate' );

const queues = require( '../queues' );

const syncImpactedEventsAndAgendas = require( './tasks/syncImpactedEventsAndAgendas' );

module.exports.init = async config => {

  const queue = queues( 'locations' );

  queue.register( {
    syncImpactedEventsAndAgendas
  } );

  queue.on( 'error', ( task, args, err ) => log( 'error', 'task %s error', task, err ) );

  await promisify( agendaLocations.init )( {
    opencage: config.opencage,
    redis: config.redis,
    elasticsearch: {
      host: _.get( config, 'es.host', 'localhost' ) + ':' + _.get( config, 'es.port', '9200' ),
      log: _.get( config, 'esLocation.log' ),
      index: _.get( config, 'esLocation.index' ),
      apiVersion: _.get( config, 'esLocation.apiVersion' ),
      timeout: _.get( config, 'esLocation.timeout' )
    },
    mysql: {
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      table: 'location',
      agendaSettingsTableName: 'location_agenda_settings'
    },
    query: _query.bind( null, config ),
    files: {
      tmpPath: config.tmpFolderPath,
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    maxLimit: 300,
    // callbacks for updating other app services when changes occur
    interfaces: {
      ...internalEventSvc.locations,
      getAgendaSettings,
      getLocationSettings,
      locationsWillMerge,
      locationWillRemove,
      onUpdate: onUpdate.bind( null, {
        queue
      } ),
      onCreate: onCreate.bind( null, {
        queue
      } ),
      getEventCounts: getEventCounts.bind( null, config.knex )
    },
    logger: config.getLogConfig( 'svc', 'agendaLocations' )
  } );

  module.exports.task = queue.run;

}


function _query( config, queryStr, values, cb ) {

  const query = config.knex.raw( queryStr, values );

  query
    .then(
      result => result[ 0 ],
      err => {

        process.nextTick( () => cb( err ) );

      }
    )
    .then( rows => {

      process.nextTick( () => cb( null, rows ) );

    } );

}
