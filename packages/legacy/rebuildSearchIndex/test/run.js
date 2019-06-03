"use strict";

const _ = require( 'lodash' );

const k = require( 'knex' )( {
  client: 'mysql',
  connection: {
    database: 'oadev',
    user: 'root',
    password: 'grut',
    timezone: 'UTC',
    charset: 'utf8mb4'
  }
} );

const fs = require( 'fs' );

const loopThroughTable = require( '../loopThroughTable' );
const formatReview = require( '../formatReview' );
const formatEvent = require( '../formatEvent' );

( async () => {

  try {

    /*console.log( JSON.stringify( await formatEvent( {
      knex: k,
      imageBasePath: '//cibuldev.s3.amazonaws.com/'
    }, 375793 ), null, 2 ) );*/

    await loopThroughTable( k, 'event', async id => {

      console.log( id );

      try {

        await formatEvent( {
          knex: k,
          imageBasePath: '//cibuldev.s3.amazonaws.com/'
        }, id );

      } catch ( e ) {

        if ( [
          'no event record',
          'no review_article record',
          'no location record',
          'invalid timings',
          'invalid location store',
          'invalid reviewer store'
        ].includes( e.message ) ) {
          console.log( e );
        } else {
          throw e;
        }

      }

    }, 180000 );

    console.log( 'done!' );

    process.exit();

  } catch ( e ) {
    console.log( e );
  }

} )();


function _readFileContent( type, id ) {

  const path = `/home/kaore/Dev/tmp/indexed/${type}.${id}.json`;

  try {
    fs.statSync( path );
  } catch ( e ) {
    return null;
  }

  return fs.readFileSync( path, 'utf-8' );

}
