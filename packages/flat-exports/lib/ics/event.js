"use strict";

const _ = require( 'lodash' );
const esc = require( './escape' );
const moment = require( 'moment' );
const getLabel = require( 'labels' )( require( 'labels/exports' ) );

module.exports = ( { lang, genUrl }, event ) => {

  const possibleLanguages = _.keys( event.title );

  const language = possibleLanguages.includes( lang ) ? lang : possibleLanguages[ 0 ];

  const url = genUrl || defaultGenUrl;

  const e = _.mapValues( {
    summary: _.get( event.title, language, '' ),
    description: [ _.get( event.description, language, null ), url( event ) ].filter( p => !!p ),
    location: [ _.get( event, 'location.name', null ), _.get( event, 'location.address', null ) ],
    geo: [ _.get( event, 'location.latitude' ), _.get( event, 'location.longitude' ) ].filter( coord => !!coord ),
    organizer: _.get( event, 'contributor.name', 'OA' ),
    url: url( event ),
    lastModified: moment.utc( event.updatedAt ).format( 'YYYYMMDDTHHmm00Z' ),
    timezone: event.timezone,
  }, v => _.isArray( v ) ? v.map( esc ) : esc( v ) );

  const before = [
    'BEGIN:VEVENT',
  ].join( '\r\n' ) + '\r\n';
    
  const after = [
    `TZID: ${e.timezone}`,
    `SUMMARY: ${e.summary}`,
    `DESCRIPTION:${e.description.join( ' - ' + getLabel( 'seeMore', language ) + ': ' )}`,
    e.location.length ? `LOCATION:${e.location.join( ' - ' )}` : null,
    e.geo.length === 2 ? `GEO:${e.geo.join( ';' )}` : null,
    `ORGANIZER: ${e.organizer}`,
    'STATUS:CONFIRMED',
    `DTSTAMP:${moment.utc().format( 'YYYYMMDDTHHmm00' ) + 'Z'}`,
    'END:VEVENT'
  ].filter( line => !!line ).join( '\r\n' );

  return event.timings.map( t => before + _createTimingPart( event, t ) + after ).join( '\r\n' ) + '\r\n';

}

function _createTimingPart( event, timing ) {

  const { begin, end } = timing;

  return [
    'UID:' + [ 
      _.get( event, 'agenda.uid', null ), 
      event.uid, 
      moment.utc( begin ).format( 'YYYY-MM-DD//HH:mm:00' )
    ].filter( i => !!i ).join( '//' ),
    `DTSTART:${moment.utc( begin ).format( 'YYYYMMDDTHHmm00' ) + 'Z'}`,
    `DTEND:${moment.utc( end ).format( 'YYYYMMDDTHHmm00' ) + 'Z'}`
  ].join( '\r\n' ) + '\r\n';

}

function defaultGenUrl( e ) { 

  return `https://openagenda.com/events/${e.slug}`;

}