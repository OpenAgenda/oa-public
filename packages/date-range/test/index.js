/* global describe, it */

"use strict";

var should = require( 'should' );
var DateRange = require('../date-range');

var testData = {
  oneDate:{
    default: [
             {
               start: new Date( '2015-12-18T07:00:00Z' ),
               end:   new Date( '2015-12-18T08:00:00Z' )
             },
             {
               start: new Date( '2015-12-18T10:00:00Z' ),
               end:   new Date( '2015-12-18T10:30:00Z' )
             },
             {
               start: new Date( '2015-12-18T11:00:00Z' ),
               end:   new Date( '2015-12-18T12:00:00Z' )
             },

    ],
    differentYear: [
             {
               start: new Date( '2014-12-18T07:00:00Z' ),
               end:   new Date( '2014-12-18T08:00:00Z' )
             },
             {
               start: new Date( '2014-12-18T10:00:00Z' ),
               end:   new Date( '2014-12-18T10:30:00Z' )
             },
             {
               start: new Date( '2014-12-18T11:00:00Z' ),
               end:   new Date( '2014-12-18T12:00:00Z' )
             },

    ],
  },

  twoDates:{

    default: [
            {
              start: new Date( '2015-12-16T07:00:00Z' ),
              end:   new Date( '2015-12-16T08:00:00Z' )
            },
            {
              start: new Date( '2015-12-18T10:00:00Z' ),
              end:   new Date( '2015-12-18T10:30:00Z' )
            },
    ],

    differentYear: [
            {
              start: new Date( '2014-12-16T07:00:00Z' ),
              end:   new Date( '2014-12-16T08:00:00Z' )
            },
            {
              start: new Date( '2014-12-18T10:00:00Z' ),
              end:   new Date( '2014-12-18T10:30:00Z' )
            },
    ]
  },

  moreDates: {
    default: [
            {
              start: new Date( '2015-12-16T07:00:00Z' ),
              end:   new Date( '2015-12-16T08:00:00Z' )
            },
            {
              start: new Date( '2015-12-18T10:00:00Z' ),
              end:   new Date( '2015-12-18T10:30:00Z' )
            },
            {
              start: new Date( '2015-12-19T10:00:00Z' ),
              end:   new Date( '2015-12-19T10:30:00Z' )
            },
            {
              start: new Date( '2015-12-19T13:00:00Z' ),
              end:   new Date( '2015-12-19T13:30:00Z' )
            },
    ]
  }
};

describe( 'date-range', function(){

  describe( 'Case: one date', function(){
    it( 'should displays as "18 December, 12:30, 15:30, 16:30"', function(){

      var dateRange = new DateRange( testData.oneDate.default, { lang: 'en' } );
      var out = dateRange.toString();
      should.exist( out );
      out.should.be.equal( '18 December, 12:30, 15:30, 16:30' );

    });

    it( 'differentYear should displays as "18 December 2014, 12:30, 15:30, 16:30"', function(){

      var dateRange = new DateRange( testData.oneDate.differentYear, { lang: 'en' } );
      var out = dateRange.toString();
      should.exist( out );
      out.should.be.equal( '18 December 2014, 12:30, 15:30, 16:30' );

    });

    it( 'differentYear, French should displays as "18 Décembre 2014, 12:30, 15:30, 16:30"', function(){

      var dateRange = new DateRange( testData.oneDate.differentYear, { lang: 'en' } );
      var out = dateRange.toString( 'fr' );
      should.exist( out );
      out.should.be.equal( '18 Décembre 2014, 12:30, 15:30, 16:30' );

    });
  });

  describe( 'Case: two dates', function(){

    it( 'if two dates, displays as "16 and 18 December"', function(){

      var dateRange = new DateRange( testData.twoDates.default, { lang: 'en' } );
      var out = dateRange.toString();
      should.exist( out );
      out.should.be.equal( '16 and 18 December' );
    });

    it( 'if two dates differentYear, displays as "16 and 18 December 2014"', function(){

      var dateRange = new DateRange( testData.twoDates.differentYear, { lang: 'en' } );
      var out = dateRange.toString();
      should.exist( out );
      out.should.be.equal( '16 and 18 December 2014' );
    });

    it( 'French: if two dates differentYear, displays as "16 et 18 Décembre 2014"', function(){

      var dateRange = new DateRange( testData.twoDates.differentYear  );
      var out = dateRange.toString( 'fr' );
      should.exist( out );
      out.should.be.equal( '16 et 18 Décembre 2014' );
    });

    it( 'French:Different initialization if two dates differentYear, displays as "16 et 18 Décembre 2014"', function(){

      var dateRange = new DateRange( testData.twoDates.differentYear, { lang: 'fr' } );
      var out = dateRange.toString();
      should.exist( out );
      out.should.be.equal( '16 et 18 Décembre 2014' );
    });


  });


  describe( 'Case: more dates', function(){

    var output = '16-19 December';
    it( 'case:default should display as"'+ output +'"', function(){

      var dateRange = new DateRange( testData.moreDates.default, { lang: 'en' } );
      var out = dateRange.toString();
      should.exist( out );
      out.should.be.equal( output );
    });


  });




});
