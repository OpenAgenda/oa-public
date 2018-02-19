"use strict";

const _ = require( 'lodash' );

module.exports = result => {

  return result.buckets.map( b => {

    let agenda = _.fromPairs( b.key.split( '|' ).map( pairString => {

      let parts = pairString.split( ':' );

      return [
        parts.shift(),
        parts.join( ':' )
      ]

    } ) );

    return {
      key: agenda.uid,
      count: b.doc_count,
      agenda: agenda
    }

  } );

}