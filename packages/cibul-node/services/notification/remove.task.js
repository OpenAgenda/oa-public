"use strict";

const async = require( 'async' );
const config = require( '../../config' );
const mysql = require( 'mysql' );
const log = require( '@openagenda/logs' )( 'services/notification/remove.task' );

module.exports = done => {

  log.info( `starting to remove old notifications at ${new Date}` );

  // count numbers notifications to delete

  const con = mysql.createConnection( config.db );
  let hasMore = true;
  let affectedRows = 0;

  async.whilst( () => hasMore, wcb => {

    con.query(
      'DELETE LOW_PRIORITY FROM `user_notification`' +
      'WHERE `created_at` < (NOW() - INTERVAL 3 MONTH) limit 10000',
      ( err, result ) => {

        if ( !result.affectedRows ) {

          hasMore = false;

        }

        affectedRows += result.affectedRows;

        log.info( 'removed %s notifications', affectedRows );

        return wcb();

      } );

  }, err => {

    if ( err ) console.error( err );

    log.info( `done removing notifications at ${new Date()}` );

    if ( done ) done();

  } );

};
