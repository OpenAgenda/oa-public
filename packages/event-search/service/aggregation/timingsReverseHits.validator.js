'use strict';

const _ = require('lodash');

const schema = require('@openagenda/validators/schema');

schema.register( {
  choice: require( '@openagenda/validators/choice' ),
  text: require( '@openagenda/validators/text' )
} );

const validate = schema( {
  field: {
    type: 'text',
    default: 'timings'
  },
  interval: {
    type: 'choice',
    unique: true,
    options: [ 'hour', 'day', 'week', 'month', 'year' ],
    default: 'day'
  },
  ranges: {
    list: true,
    fields: {
      from: {
        type: 'string'
      },
      to: {
        type: 'string'
      }
    }
  },
  size: {
    type: 'integer',
    default: 3
  },
  format: {
    type: 'choice',
    unique: true,
    options: [ 'YYYY-MM-dd', 'YYYY-MM', 'YYYY', 'YYYY-MM-dd HH:mm' ],
    default: 'YYYY-MM-dd'
  }
} );

const validateDate = require( '@openagenda/validators/date' )( { default: 'now' } );

module.exports = (values, options = {}) => {

  const { config } = options;

  const clean = validate( values );

  // config is not available at require, needs to be included at eval
  clean.includes = config.baseSearchIncludes;

  // range needs to be specified here
  clean.ranges = _ranges(
    _.get( values, 'query.date.gte', null ),
    _.get( values, 'query.date.lte', null )
  );

  return clean;

}


function _ranges( fromDate = null, toDate = null ) {

  let cursor = validateDate( fromDate ),

    lastDate = toDate ? validateDate( toDate ) : null,

    ranges = [];

  if ( !fromDate ) {

    cursor.setDate( 1 );

  }

  if ( !toDate ) {

    lastDate = new Date( cursor );

    lastDate.setMonth( lastDate.getMonth() + 1 );

    lastDate.setDate( 0 );

  }

  while ( _stringifyDate( cursor ) <= _stringifyDate( lastDate ) ) {

    ranges.push( { from: _stringifyDate( cursor ) } );

    cursor.setDate( cursor.getDate() + 1 );

    ranges[ ranges.length - 1 ].to = _stringifyDate( cursor );

  }

  return ranges;

}


function _stringifyDate( dirtyDate ) {

  let d = new Date();

  if ( dirtyDate ) {

    d = validateDate( dirtyDate );

  }

  return [ d.getFullYear(), _fZ( d.getMonth() + 1 ), _fZ( d.getDate() ) ].join( '-' );

}

function _fZ( str ) {

  if ( ( str + '' ).length == 1 ) {

    return '0' + str;

  }

  return str;

}
