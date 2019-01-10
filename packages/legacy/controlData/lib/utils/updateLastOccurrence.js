"use strict";

const _ = require( 'lodash' );

module.exports = ( controlData, timings = [] ) => {

  const lastTimings = _.last( timings );

  const current = controlData.lo ? {
    start: new Date( controlData.lo.start ),
    end: new Date( controlData.lo.end )
  } : null;

  if ( !current || controlData.lo.start < new Date( lastTimings.begin ) ) {

    controlData.lo = {
      start: lastTimings.begin,
      end: lastTimings.end
    }

  }

}
