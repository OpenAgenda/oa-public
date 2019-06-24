"use strict";

const should = require( 'should' );

const occurrencesToTimings = require( '../service/lib/occurrencesToTimings' );

describe( 'events - unit (server): legacy bridge - occurrencesToTimings', function() {

  it( 'converts legacy occurrences structure to timings', () => {

    const timings = occurrencesToTimings( [ {
      date: new Date( '2019-06-03T00:00:00.000Z' ),
      time_start: '14:08',
      time_end: '15:00'
    } ], 'Europe/Paris' );

    JSON.stringify( timings ).should.equal( [
      '[{',
        '"begin":"2019-06-03T12:08:00.000Z",',
        '"end":"2019-06-03T13:00:00.000Z"',
      '}]'
    ].join( '' ) );

  } );

  it( 'end part of timing is always after begin', () => {

    const timings = occurrencesToTimings( [ {
      date: new Date( '2018-04-10T00:00:00.000Z' ),
      time_start: '10:00:00',
      time_end: '00:00:00'
    } ], 'Europe/Paris' );

    JSON.stringify( timings ).should.equal( [
      '[{',
        '"begin":"2018-04-10T08:00:00.000Z",',
        '"end":"2018-04-10T22:00:00.000Z"',
      '}]'
    ].join( '' ) );

  } );

} );
