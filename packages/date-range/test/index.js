/* global describe, it */

"use strict";

var should = require( 'should' ),

range = require('../'),

testData = require( './data' );

describe( 'date-range', () => {

  describe( 'no dates', () => {

    it( 'empty array input should display "no dates available"', () => {

      range( [], 'en' )

      .should.equal( 'no dates available' );

    } );

    it( 'undefined input should display "no dates available', () => {

      range( undefined, 'en' )

      .should.equal( 'no dates available' );

    } );

  } );

  describe( 'one date', () => {

    var output = '18 december, 07:00, 10:00, 11:00';

    it( 'should displays as "'+ output +'"', function(){

      range( testData.oneDate.default, 'en' )
      
      .should.be.equal( output );

    });

    var output2 = '18 december 2014, 07:00, 10:00, 11:00';

    it( 'differentYear should displays as "'+ output2 +'"', () => {

      range( testData.oneDate.differentYear, 'en' )
      
      .should.be.equal( output2 );

    });

    var output3 = '18 décembre 2014, 07h00, 10h00, 11h00';

    it( 'differentYear, French should displays as "'+ output3 +'"', () => {

      range( testData.oneDate.differentYear, 'fr' )

      .should.be.equal( output3 );

    } );

  } );

  describe( 'Case: two dates', () => {

    var output = '16 and 18 december';

    it( 'if two dates, displays as "'+ output +'"', () => {

      range( testData.twoDates.default, 'en' )
      
      .should.be.equal( output );

    } );

    var output2 = '16 and 18 december 2014';

    it( 'if two dates differentYear, displays as "'+ output2 +'"', () => {

      range( testData.twoDates.differentYear, 'en' )

      .should.be.equal( output2 );

    } );

    var output3 = '16 et 18 décembre 2014';

    it( 'French: if two dates differentYear, displays as "'+ output3 +'"', () => {

      range( testData.twoDates.differentYear, 'fr' )
      
      .should.be.equal( output3 );

    } );


    var output4 = '16 et 18 décembre 2014';

    it( 'French: Different initialization if two dates differentYear, displays as "'+ output4 +'"', function(){

      range( testData.twoDates.differentYear, 'fr' )

      .should.be.equal( output4 );

    } );


    it( 'if one date on different year only, display both years: 16 décembre 2014 et 18 décembre 2016', () => {

      range( testData.twoDates.oneDifferentYear, 'fr' )

      .should.be.equal( '16 décembre 2014 et 18 décembre 2016' );

    } );


  });


  describe( 'Case: more dates', () => {

    var output = '16 - 19 december';

    it( 'case:default should display as"'+ output +'"', () => {

      range( testData.moreDates.default, 'en' )

      .should.be.equal( output );
      
    });

    it( 'should display months when more than one', () => {

      range( testData.moreDates.multipleMonths, 'en' )

      .should.equal( '16 november - 19 december' );

    } );


  });


  describe( 'patterns', () => {

    it( 'appends an information relative to the day of the week: 1 - 22 december 2015, on tuesdays', () => {

      range( testData.moreDates.tuesdays, 'en' )

      .should.equal( '1 - 22 december 2015, on tuesdays' );

    } );

  } );


});
