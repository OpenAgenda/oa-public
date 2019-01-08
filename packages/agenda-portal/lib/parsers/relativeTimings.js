"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

// assumes timings are sorted
module.exports = ( event, { moment } ) => {

  if ( !event.timings || !event.timings.length ) {

    return event;

  }

  let last = event.timings.slice( -1 )[ 0 ],

    next = null, now = new Date(),

    update = {
      lastTiming: { $set: _appendLabel( last, moment ) },
      nextTiming: { $set: null },
    };

  if ( last && ( new Date( last.end ) < now ) ) {

    // if last is in the past, there is no next timing

    return ih( event, update );

  }

  for ( let t of event.timings ) {

    // go through timings, keep the first one that finishes in the future
    if ( new Date( t.end ) > now ) {

      update.nextTiming = { $set: _appendLabel( t, moment ) };

      break;

    }

  }

  return ih( event, update );

}

function _appendLabel( timing, moment ) {

  return _.assign( timing, {
    label: _.capitalize( moment( timing.start ).fromNow() )
  } );

}
