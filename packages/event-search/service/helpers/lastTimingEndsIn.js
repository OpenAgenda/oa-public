"use strict";

module.exports = event => {

  if ( !event.timings || !event.timings.length ) {

    return '0d';

  }

  let lastEndTime = event.timings.reduce( ( last, timing ) => timing.end > last ? timing.end : last, event.timings[ 0 ].end );

  let now = new Date();

  if ( lastEndTime < now ) return 0;

  return Math.ceil( ( ( new Date( lastEndTime ) ).getTime() - ( new Date() ).getTime() ) / 1000 / 60 / 60 / 24 );

}