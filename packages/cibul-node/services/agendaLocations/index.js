"use strict";

const { promisify } = require( 'util' );

const _ = require( 'lodash' );

const agendaLocations = require( '@openagenda/agenda-locations' );

const internalEventSvc = require( '../event' );

const agendas = require( '@openagenda/agendas' );

const agendaGet = promisify( agendas.get );

const getLocationSettings = require( './interfaces/getLocationSettings' );

module.exports.init = async config => {

  await promisify( agendaLocations.init )( {
    geocodefarm: config.geocodeFarm,
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
    interfaces: _.extend( {
      getAgendaSettings: ( agendaId, cb ) => {

        agendas.get( agendaId, ( err, agenda ) => cb( err, agenda ? agenda.settings : {} ) )

      },
      getLocationSettings,
      getEventCounts: async ( agendaIdentifiers, locationUids ) => {

        const agenda = await agendaGet( agendaIdentifiers, {
          private: null
        } );

        if ( !agenda ) return [];

        const records = await config.knex( 'event_2 as e' )
          .select( [ 'e.location_uid as locationUid', config.knex.raw( 'count( e.id ) as eventCount' ) ] )
          .leftJoin( 'agenda_event as ae', 'e.uid', 'ae.event_uid' )
          .whereIn( 'e.location_uid', locationUids )
          .andWhere( 'ae.agenda_uid', agenda.uid )
          .groupBy( 'e.location_uid' );

        return records.map( r => ( {
          uid: r.locationUid,
          count: r.eventCount
        } ) );

      }
    }, internalEventSvc.locations ),
    logger: config.getLogConfig( 'svc', 'locations' )
  } );

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
