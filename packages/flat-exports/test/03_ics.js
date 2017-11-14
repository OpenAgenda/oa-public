"use strict";

const should = require( 'should' );
const moment = require( 'moment-timezone' );
const ics = require( '../lib/ics' );
const event = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/fixtures/acces-libre.json', 'utf-8' ) );

describe( 'flat-exports - unit - ics', () => {

  describe( 'helpers', () => {

    test( 'ics head', () => {

      ics.head( {
        slug: 'la-gargouille',
        identifier: 123,
        type: 'agenda',
        lang: 'fr',
        title: 'La Gargouille',
        description: 'Evénements à Paris'
      } )

        .should.equal( [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//la-gargouille//agenda//fr',
          'METHOD:PUBLISH',
          'X-WR-CALNAME:La Gargouille',
          'X-WR-CALDESC: Evénements à Paris',
          'X-WR-RELCALID: 123'
        ].join( '\r\n' ) + '\r\n' )

    } );

    test( 'ics event', () => {

      const result = ics.event( { lang: 'fr' }, event );

      result.should.eql( [
        'BEGIN:VEVENT',
        'UID:54284894//48919824//2017-10-02//08:00:00',
        'DTSTART:20171002T080000Z',
        'DTEND:20171002T100000Z',
        'TZID: Europe/Paris',
        'SUMMARY: Accès libre',
        'DESCRIPTION:Accès libre accompagné - voir plus: https://openagenda.com/events/acces-libre_337',
        'LOCATION:MMN13 - 47 rue du javelot 75013',
        'GEO:48.824478;2.365424',
        'ORGANIZER: OA',
        'STATUS:CONFIRMED',
        'DTSTAMP:' + moment.tz().format( 'YYYYMMDDTHHmm00Z' ).replace('+00:00', 'Z' ),
        'END:VEVENT'
      ].join( '\r\n' ) + '\r\n' );

    } );

  } );

} );