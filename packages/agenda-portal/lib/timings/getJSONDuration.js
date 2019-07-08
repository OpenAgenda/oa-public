"use strict";

const moment = require( 'moment-timezone' );

module.exports = ( start, end ) => moment.duration(
  new Date( end ).getTime() - new Date( start ).getTime()
).toJSON()
