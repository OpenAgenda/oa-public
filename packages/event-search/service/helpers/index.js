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
  indexBulk
}

let count = 0;

function indexBulk( v, events, cb ) {

  const body = _.flatten( events.map( e => [ {
    index: {
      _index: v.process.indexName,
      _type: v.type,
      _id: e.uid
    }
  }, v.preParse( e ) ] ) );

  v.client.bulk( {
    body
  }, cb );

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

        return d.reject( new VError( err, 'provided list failed: %s', namespace ) );

      }

      if ( !_.isArray( events ) ) {

        return d.reject( 'list function is not giving a list: %s', namespace );

      }

      return d.resolve( v );

    } );

    return d.promise;

  }

}