"use strict";

const moment = require( 'moment-timezone' );
const tz = moment.tz;

module.exports = (
  timing,
  timezone = 'Europe/Paris'
) => ( {
  ... timing,
  ... {
    start: tz( timing.start, timezone ).format(),
    end: tz( timing.end, timezone ).format()
  }
} );
