/* global describe, it */

"use strict";

require( 'should' );

var range = require('..'),

testData = require( './data' );

describe( 'date-range', () => {

  describe( 'no dates', () => {
    it( 'empty array input should display "no dates available"', () => {
      expect(range( [], 'en' )).toBe('no dates available');
    } );

    it( 'undefined input should display "no dates available', () => {
      expect(range( undefined, 'en' )).toBe('no dates available');
    } );
  } );

  describe( 'one date', () => {
    it( 'should displays as "Tuesday 18 December 2018, 07:00, 10:00, 11:00"', function() {
      expect(range( testData.oneDate.winterDefault, 'en' )).toBe('Tuesday 18 December 2018, 07:00, 10:00, 11:00');
    });

    it( 'should display as "Tuesday 18 December 2018, 08:00, 11:00, 12:00"', () => {
      expect(range( testData.oneDate.winterDefault, 'en', 'Europe/Paris' )).toBe('Tuesday 18 December 2018, 08:00, 11:00, 12:00');
    } );

    it( 'should display as "Wednesday 18 April 2018, 09:00, 12:00, 13:00"', () => {
      expect(range( testData.oneDate.summerDefault, 'en', 'Europe/Paris' )).toBe('Wednesday 18 April 2018, 09:00, 12:00, 13:00');
    } );

    var output2 = 'Thursday 18 December 2014, 07:00, 10:00, 11:00';

    it( 'differentYear should displays as "'+ output2 +'"', () => {
      expect(range( testData.oneDate.differentYear, 'en' )).toBe(output2);
    });

    var output3 = 'Jeudi 18 décembre 2014, 07h00, 10h00, 11h00';

    it( 'differentYear, French should displays as "'+ output3 +'"', () => {
      expect(range( testData.oneDate.differentYear, 'fr' )).toBe(output3);
    } );
  } );

  describe( 'Case: two dates', () => {

    var output = '16 and 18 December 2018';

    it( 'if two dates, displays as "'+ output +'"', () => {

      expect(range( testData.twoDates.default, 'en' )).toBe( output );

    } );

    var output2 = '16 and 18 December 2014';

    it( 'if two dates differentYear, displays as "'+ output2 +'"', () => {

      expect(range( testData.twoDates.differentYear, 'en' )).toBe( output2 );

    } );

    var output3 = '16 et 18 décembre 2014';

    it( 'French: if two dates differentYear, displays as "'+ output3 +'"', () => {

      expect(range( testData.twoDates.differentYear, 'fr' )).toBe( output3 );

    } );


    var output4 = '16 et 18 décembre 2014';

    it( 'French: Different initialization if two dates differentYear, displays as "'+ output4 +'"', function(){

      expect(range( testData.twoDates.differentYear, 'fr' )).toBe( output4 );

    } );


    it( 'if one date on different year only, display both years: 16 décembre 2014 et 18 décembre 2016', () => {

      expect(range( testData.twoDates.oneDifferentYear, 'fr' )).toBe( '16 décembre 2014 et 18 décembre 2018' );

    } );


  });


  describe( 'Case: more dates', () => {

    var output = '16 - 19 December 2018';

    it( 'case:default should display as"'+ output +'"', () => {

      expect(range( testData.moreDates.default, 'en' )).toBe( output );

    });

    it( 'should display months when more than one', () => {

      expect(range( testData.moreDates.multipleMonths, 'en' )).toBe( '16 November - 19 December 2018' );

    } );


  });


  describe( 'wrong input', () => {

    it( 'renders in english if unknown or non existing language is input', () => {
      expect(range( testData.moreDates.default, 'ak' )).toBe( '16 - 19 December 2018' );
    } );

  } );


  describe( 'patterns', () => {
    it( 'appends an information relative to the day of the week: 1 - 22 december 2015, every Tuesday', () => {
      expect(range( testData.moreDates.tuesdays, 'en' )).toBe( '1 - 22 December 2015, every Tuesday' );
    } );
    it('appends an information relative to the day of the week: 1 - 22 december 2015, tous les mardis', () => {
      expect(range(testData.moreDates.tuesdays, 'fr')).toBe('1 - 22 décembre 2015, tous les mardis');
    });
  } );


});
