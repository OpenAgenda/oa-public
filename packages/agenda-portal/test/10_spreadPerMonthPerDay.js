"use strict";

const fs = require( 'fs' );
const should = require( 'should' );

const spreadPerMonth = require( '../lib/parsers/spreadPerMonthPerDay' );

describe( '10 spreadPerMonthPerDay', () => {

  const timings = [ {
    start: new Date( '2018-10-10T10:00:00+0100' ),
    end: new Date( '2018-10-10T11:00:00+0100' )
  }, {
    start: new Date( '2018-11-15T10:00:00+0100' ),
    end: new Date( '2018-11-11T15:00:00+0100' )
  }, {
    start: new Date( '2018-12-01T00:00:00+0100' ),
    end: new Date( '2018-12-01T01:00:00+0100' )
  } ];

  const spreadTimings = fs.readFileSync( __dirname + '/fixtures/spreadTimings.json', 'utf-8' ).trim( '\n' )
  const spreadTimingsNYC = fs.readFileSync( __dirname + '/fixtures/spreadTimings.nyc.json', 'utf-8' ).trim( '\n' )

  it( 'Timings are distributed in an array of months and sub-array of days', () => {

    const result = spreadPerMonth( timings, 'Europe/Paris', 'fr' );

    JSON.stringify( result, null, 2 ).should.equal( spreadTimings );

  } );

  it( 'When december hits Paris, it is still november in New York', () => {

    const result = spreadPerMonth( timings, 'America/New_York', 'en' );

    JSON.stringify( result, null, 2 ).should.equal( spreadTimingsNYC );

  } );

} );
