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

function _omit( e ) {

  const filtered = _.omit( e, [
    'title',
    'tags',
    'description',
    'freeText',
    'reviewId'
  ] );

  filtered.articles = filtered.articles.map( a => _.omit( a, [
    'reviewer'
  ] ) );

  filtered.locations = filtered.locations.map( l => _.omit( l, [
    'image',
    'verified',
    'ticketLink',
    'pricingInfo',
    'timings',
    'store',
    'countryCode'
  ] ) );

  return filtered;

}

( async () => {

  const eventFilesPath = '/home/kaore/Dev/tmp/indexed/events/';
  const diffFilesPath = '/home/kaore/Dev/tmp/indexed/diff/';

  try {

    for ( const filename of fs.readdirSync( eventFilesPath ) ) {

      const ref = JSON.stringify( _omit( JSON.parse(
        fs.readFileSync( eventFilesPath + filename, 'utf-8' )
      ) ), null, 2 );

      const eventId = filename.split( '.' )[ 1 ];

      if ( eventId <= 397054 ) continue;

      console.log( eventId );

      try {

        const newRef = JSON.stringify( _omit( await formatEvent( {
          knex: k,
          imageBasePath: '//cibuldev.s3.amazonaws.com/'
        }, eventId ) ), null, 2 );

        if ( ref !==  newRef ) {

          fs.writeFileSync(
            diffFilesPath + filename,
            ref,
            'utf-8'
          );

          fs.writeFileSync(
            diffFilesPath + filename + '.new.json',
            newRef,
            'utf-8'
          );

          throw 'DIFF!';

        }

      } catch ( e ) {
        if ( [
          'no event record',
          'no review_article record',
          'no location record',
          'invalid timings',
          'invalid location store',
          'invalid reviewer store',
          'invalid title',
          'invalid description',
          'invalid freeText',
          'invalid article store'
        ].includes( e.message ) ) {
          console.log( e );
        } else {
          throw e;
        }
      }

    }

    /*console.log( JSON.stringify( await formatEvent( {
      knex: k,
      imageBasePath: '//cibuldev.s3.amazonaws.com/'
    }, 375793 ), null, 2 ) );*/

    /*await loopThroughTable( k, 'event', async id => {

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
          'invalid reviewer store',
          'invalid title',
          'invalid description',
          'invalid freeText',
          'invalid article store'
        ].includes( e.message ) ) {
          console.log( e );
        } else {
          throw e;
        }

      }

    } );*/

    console.log( 'done!' );

  } catch ( e ) {
    console.log( e );
  }

  process.exit();

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
