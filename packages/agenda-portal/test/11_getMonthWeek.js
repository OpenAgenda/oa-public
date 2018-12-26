"use strict";

const should = require( 'should' );

const getMonthWeek = require( '../lib/parsers/getMonthWeek' );

describe( '11 getMonthWeek', () => {

  it( 'returns week of month', () => {

    getMonthWeek( new Date( '2018-12-01T10:00:00Z' ), 'Europe/Paris' ).should.equal( 1 );

    getMonthWeek( new Date( '2018-12-23T10:00:00Z' ), 'Europe/Paris' ).should.equal( 4 );

  } );

} );
