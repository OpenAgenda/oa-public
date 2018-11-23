import _ from 'lodash';
import ih from 'immutability-helper';
import moment from 'moment';

export function appendMoreItem( labels, eventItems, view ) {

  return eventItems.sort( ( e1, e2 ) => e1.begin > e2.begin ).concat( {
    type: 'more',
    key: eventItems[ 0 ].date,
    begin: _.last( eventItems ).begin, // used by component to display in order
    end: _.last( eventItems ).end,
    title: labels.more,
    allDay: view === 'week'
  } )

}

export function flattenTargetedLabels( keys, targetLang, obj ) {

  return _.keys( obj ).reduce( ( flatObj, key ) => {

    if ( keys.includes( key ) ) {

      flatObj[ key ] = pickLang( obj[ key ], targetLang );

    } else {

      flatObj[ key ] = obj[ key ];

    }

    return flatObj;

  }, {} );

}

export function pickLang( multi, preferredLang ) {

  if ( multi[ preferredLang ] ) return multi[ preferredLang ];

  return multi[ _.first( _.keys( multi ) ) ];

}

export function getMonth( d ) {

  if ( !d ) d = new Date();

  return [ d.getFullYear(), fZ( d.getMonth() + 1 ) ].join( '-' );

}

export function getWeekBrackets( d ) {

  const end = new Date( d );

  const begin = new Date( d );

  // if d is a sunday, counts as previous week

  if ( d.getDay() === 0 ) d.setDate( d.getDate() - 1 );

  begin.setDate( d.getDate() - d.getDay() + 1 );

  end.setDate( begin.getDate() + 6 );


  return [
    getDateString( begin ),
    getDateString( end )
  ]

}

export function getTimeBrackets( type, d ) {

  if ( ![ 'week', 'month' ].includes( type ) ) {

    throw new Error( 'unknown time bracket type' );

  }

  if ( type === 'month' ) return getMonthBrackets( d );

  return getWeekBrackets( d );

}

export function getMonthBrackets( d ) {

  const begin = getMonth( d ) + '-01';

  const end = new Date( begin );

  end.setMonth( end.getMonth() + 1 );

  end.setDate( 0 );

  return [ begin, getDateString( end ) ];

}

export function getDateString( d ) {

  return [ d.getFullYear(), fZ( d.getMonth()+1 ), fZ( d.getDate() ) ].join( '-' );

}

export function spreadEventsOnDateTimings( events, targetDate /*YYYY-MM-DD*/ ) {

  return events.reduce( ( processed, event ) => {

    const timelessEvent = _.omit( event, [ 'timings' ] );

    return processed.concat(
      event.timings.filter( t => moment( t.begin ).format( 'YYYY-MM-DD' ) === targetDate )
      .map( t => ih( timelessEvent, {
        key: { $set: timelessEvent.uid + '/' + targetDate },
        date: { $set: targetDate },
        begin: { $set: new Date( t.begin ) },
        end: { $set: new Date( t.end ) }
      } ) )
    );

  }, [] );

}

export function fZ( n ) {

  return n < 10 ? '0' + n : n;

}
