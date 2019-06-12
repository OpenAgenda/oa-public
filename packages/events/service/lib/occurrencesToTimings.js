"use strict";

const moment = require( 'moment-timezone' );

module.exports = ( occurrences = [], timezone = 'Europe/Paris' ) => occurrences
  .sort( ( a, b ) => new Date( a.date + 'T' + a.time_start ) < new Date( a.date + 'T' + a.time_end ) ? 1 : -1 )
  .map( o => ( {
    begin: _readOccurrenceTime( o, 'time_start', timezone ),
    end: _readOccurrenceTime( o, 'time_end', timezone )
  } ) )
  .map( _endIsAfterBegin );


function _endIsAfterBegin( timing ) {
  if ( timing.begin <= timing.end ) {
    return timing;
  }

  const end = new Date( timing.end );

  end.setDate( end.getDate() + 1 );

  return {
    begin: timing.begin,
    end
  }
}

function _readOccurrenceTime( o, t, timezone ) {
  return new Date(
    moment.tz(
      moment( o.date ).format( 'YYYY-MM-DD' )
      + ' '
      + o[ t ],
      timezone
    ).format()
  );
}
