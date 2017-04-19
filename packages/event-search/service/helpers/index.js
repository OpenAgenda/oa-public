"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const w = require( 'when' );

module.exports = {
  checkList,
  createIndexName: require( './createIndexName' ),
  createUniqueIndex: require( './createUniqueIndex' ),
  readIndexName: require( './readIndexName' ),
  removeIndex: require( './removeIndex' ),
  reassociateAlias: require( './reassociateAlias' ),
  indexEvent, // unused for now.
  indexBulk
}

let count = 0;

function indexBulk( v, events, cb ) {

  const body = _.flatten( events.map( e => [ {
    index: {
      _index: v.process.indexName,
      _type: v.type,
      _id: e.id
    }
  }, v.preParse( e ) ] ) );

  v.client.bulk( {
    body
  }, cb );

}

function indexEvent( v, event, cb ) {

  // index as is
  v.client.index({
    index: v.process.indexName,
    type: 'event',
    id: event.id,
    body: preParse( event )
  }, ( err, result ) => {

    cb( err );

  } );

}

function checkList( namespace ) {

  return v => {

    const listFunc = _.get( v, namespace );

    if ( typeof listFunc !== 'function' ) {

      throw new Error( namespace.split( '.' ).pop() + ' is not a function' ) 

    }

    let d = w.defer();

    listFunc( 0, 1, ( err, events ) => {

      if ( err ) {

        return d.reject( new VError( err, 'provided list failed' ) );

      }

      if ( !_.isArray( events ) ) {

        return d.reject( 'list function is not giving a list' );

      }

      return d.resolve( v );

    } );

    return d.promise;

  }

}