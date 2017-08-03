"use strict";

const users = require( 'users' );

const agendaStakeholders = require( 'agenda-stakeholders' ),

  async = require( 'async' ),

  logger = require( 'logger' ),

  keys = require( 'keys' ),

  agendas = require( 'agendas' ),

  activities = require( 'activities' );

let log = console.log;

module.exports.init = async config => {

  log = logger( 'users interface' );

  await users.init( {
    mysql: config.db,
    schemas: config.schemas,
    files: {
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId, // required
      secretAccessKey: config.aws.secretAccessKey,
      tmpPath: config.tmpFolderPath
    },
    interfaces: {
      beforeRemove,
      getAgenda: ( agendaUid, cb ) => agendas.get( { uid: agendaUid }, cb ),
      keys: {
        get: identifiers => keys( identifiers ).get(),
        create: ( identifiers, data ) => keys( identifiers ).create( data ),
        remove: identifiers => keys( identifiers ).remove()
      }
    },
    logger
  } );

}

/**
 * this interface will prevent user removal if not correctly executed
 */
function beforeRemove( user, cb ) {

  // remove 100 stakeholders

  activities.feed( { entityType: 'user', entityUid: user.uid } ).remove( () => {

    agendaStakeholders.user( user.id ).list( 0, 100, ( err, stakeholders ) => {

      async.eachSeries(
        stakeholders,
        ( sh, acb ) => {

          agendaStakeholders.agenda( sh.agendaId ).update( { id: sh.id }, {}, {
            allowPartial: true,
            deletedUser: true
          }, err => {

            if ( err ) log( 'error', 'could not remove stakeholder ', err );

            acb( null );

          } );

        },
        () => cb()
      );

    } );

  } );

}