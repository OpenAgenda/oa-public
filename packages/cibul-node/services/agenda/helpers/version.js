"use strict";

const config = require( '../../../config' );

module.exports = function( namespace, testedVersion, criterias ) {

  let matching = config.versions[ namespace ].filter( v => {

    // version is determined by agendaUid
    if ( v.agendaUids ) {

      return v.agendaUids.indexOf( criterias.agendaUid ) !== -1;

    }

    // version is all inclusive.
    return true;

  } );

  // no match at all
  if ( !matching.length ) return false;

  // first matching version is kept
  return matching[ 0 ].version === testedVersion;

}