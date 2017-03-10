"use strict";

const knexLib = require( 'knex' );
const fixtures = require( 'fixtures' );

module.exports = ( config, files, options, cb ) => {

  const params = Object.assign( {
    reset: true
  }, options );

  fixtures.init( { mysql: config.mysql } );

  // reset before migrations if needed
  fixtures( [], { reset: params.reset }, err => {

    if ( err ) {

      console.log( err );
      return cb( err );

    }

    const knex = knexLib( {
      client: 'mysql',
      connection: config.mysql,
      migrations: config.migrations,
      schemas: config.schemas
    } );

    knex.migrate.latest()
      .then( data => {

        fixtures( [ {
          table: config.schemas.activity,
          src: __dirname + '/activity.data.sql'
        }, {
          table: config.schemas.feed,
          src: __dirname + '/feed.data.sql'
        }, {
          table: config.schemas.feed_activity,
          src: __dirname + '/feed_activity.data.sql'
        }, {
          table: config.schemas.feed_follow,
          src: __dirname + '/feed_follow.data.sql'
        }, {
          table: config.schemas.feed_notification,
          src: __dirname + '/feed_notification.data.sql'
        } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), { reset: false }, cb );

      } )
      .catch( err => {

        console.log( err );
        cb( err );

      } );

  } );

}