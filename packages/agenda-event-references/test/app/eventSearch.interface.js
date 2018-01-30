"use strict";

const _ = require( 'lodash' );

const testEvents = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/events.json' ) );


/**
 * the following function is given to service through interface
 */

module.exports = function( agendaId, query, options, cb ) {

  cb( null, testEvents

    .filter( _filterByQuery.bind( null, query ) )

    .filter( _filterByUids.bind( null, query.uids ) )

  );

}

function _filterByUids( uids, e ) {

  if ( !uids ) return true;

  return uids.map( uid => parseInt( uid ) ).indexOf( e.uid ) !== -1;

}

function _filterByQuery( query, e ) {

  if ( query.exclude && _.isArray( query.exclude ) ) {

    if ( query.exclude.map( x => parseInt( x ) ).indexOf( e.uid ) !== -1 ) return false;

  }

  if ( !query.search ) {

    return true;

  }

  return [ e.title, e.location.name, e.location.address ].filter( text => {

    if ( typeof text === 'object' ) {

      return !!Object.keys( text ).filter( k => {

        return text[ k ].toLowerCase().indexOf( query.search.toLowerCase() ) !== -1;

      } ).length;

    } else {

      return text.toLowerCase().indexOf( query.search.toLowerCase() ) !== -1;

    }

  } ).length ? true : false;

}