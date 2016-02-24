"use strict";

// initialize agenda-locations service

var config = require( '../../config' ),

al = require( 'agenda-locations' ),

utils = require( 'utils' ),

eventSvc = require( '../../services/event' );

module.exports = function( options, cb ) {

  var params = utils.extend( {
    logger: false
  }, options );

  al.init( {
    geocodefarm: config.geocodeFarm,
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
    files: {
      tmpPath: config.tmpFolderPath,
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    // callbacks for updating other app services when changes occur
    interfaces: eventSvc.locations,
    logger: params.logger
  }, () => {

    if ( cb ) cb();

  } );

}