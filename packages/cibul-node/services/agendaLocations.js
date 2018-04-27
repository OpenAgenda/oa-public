"use strict";

const agendaLocations = require( '@openagenda/agenda-locations' );

const internalEventSvc = require( './event' ),

  agendas = require( '@openagenda/agendas' ),

  logger = require( '@openagenda/logger' ),

  _ = require( 'lodash' );

module.exports.init = ( config, cb ) => {

  agendaLocations.init( {
    geocodefarm: config.geocodeFarm,
    redis: config.redis,
    elasticsearch: {
      host: config.es.host + ':' + config.es.port,
      log: config.esLocation.log,
      index: config.esLocation.index,
      apiVersion: config.esLocation.apiVersion,
      timeout: config.esLocation.timeout
    },
    mysql: {
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      table: 'location',
      agendaSettingsTableName: 'location_agenda_settings'
    },
    files: {
      tmpPath: config.tmpFolderPath,
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    maxLimit: 300,
    // callbacks for updating other app services when changes occur
    interfaces: _.extend( {
      getAgendaSettings: ( agendaId, cb ) => {

        agendas.get( agendaId, ( err, agenda ) => cb( err, agenda ? agenda.settings : {} ) )

      }
    }, internalEventSvc.locations ),
    logger
  }, cb );

}