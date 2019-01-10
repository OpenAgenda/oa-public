"use strict";

const _ = require( 'lodash' );
const moment = require( 'moment-timezone' );

module.exports = ( data, tagsAndCategory ) => {

  const parsed = _.mapValues( {
    u: 'uid',
    l: 'locationUid',
    s: 'slug',
    tz: 'timezone'
  }, value => _.get( data, value ) );

  // assemble timings
  parsed.d = data.timings.map( t => moment.tz( t.begin, data.timezone ).format( 'YYYY-MM-DD' ) );

  return _.assign( parsed, tagsAndCategory );

};
