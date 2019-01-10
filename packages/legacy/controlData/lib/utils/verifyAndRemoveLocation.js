"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'controlData/utils/verifyAndRemoveLocation' );

/**
 * verify if location associated to event of index eventIndex is referenced
 * by other event. If it is not, remove it from location list
 */
module.exports = ( ctlData, eventIndex ) => {

  const locationUid = ctlData.ev[ eventIndex ].l;

  for( let cursor = 0; cursor < ctlData.ev.length; cursor++ ) {

    if ( cursor === eventIndex ) continue;

    if ( ctlData.ev[ cursor ].l === locationUid ) return null;

  }

  // if we are here, no other event referencing location uid was found
  const locationIndex = _.findIndex( ctlData.l, { u: locationUid } );

  if ( locationIndex === -1 ) {

    log( 'warn', 'location %s was not found in control data location index', locationUid );

    return null;

  } else {

    const location = ctlData.l[ locationIndex ];

    return _.first( ctlData.l.splice( locationIndex, 1 ) );

  }

}
