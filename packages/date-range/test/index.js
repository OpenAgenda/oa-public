/* global describe, it */

"use strict";

var should = require( 'should' );
var DateRange = require('../date-range');
var testData = require('./data');


describe( 'date-range', function(){

  describe( 'Case: one date', function(){
    var output = '18 December, 07:00, 10:00, 11:00';
    it( 'should displays as "'+ output +'"', function(){

      var dateRange = new DateRange( testData.oneDate.default, { lang: 'en' } );
      var out = dateRange.toString();
      should.exist( out );
      out.should.be.equal( output );

    });

    var output2 = '18 December 2014, 07:00, 10:00, 11:00';
    it( 'differentYear should displays as "'+ output2 +'"', function(){

      var dateRange = new DateRange( testData.oneDate.differentYear, { lang: 'en' } );
      var out = dateRange.toString();
      should.exist( out );
      out.should.be.equal( output2 );

    });

    var output3 = '18 Décembre 2014, 07:00, 10:00, 11:00';
    it( 'differentYear, French should displays as "'+ output3 +'"', function(){

      var dateRange = new DateRange( testData.oneDate.differentYear, { lang: 'en' } );
      var out = dateRange.toString( 'fr' );
      should.exist( out );
      out.should.be.equal( output3 );

    });
  });

  describe( 'Case: two dates', function(){

    var output = '16 and 18 December';
    it( 'if two dates, displays as "'+ output +'"', function(){

      var dateRange = new DateRange( testData.twoDates.default, { lang: 'en' } );
      var out = dateRange.toString();
      should.exist( out );
      out.should.be.equal( output );
    });

    var output2 = '16 and 18 December 2014';
    it( 'if two dates differentYear, displays as "'+ output2 +'"', function(){

      var dateRange = new DateRange( testData.twoDates.differentYear, { lang: 'en' } );
      var out = dateRange.toString();
      should.exist( out );
      out.should.be.equal( output2 );
    });

    var output3 = '16 et 18 Décembre 2014';
    it( 'French: if two dates differentYear, displays as "'+ output3 +'"', function(){

      var dateRange = new DateRange( testData.twoDates.differentYear  );
      var out = dateRange.toString( 'fr' );
      should.exist( out );
      out.should.be.equal( output3 );
    });


    var output4 = '16 et 18 Décembre 2014';
    it( 'French:Different initialization if two dates differentYear, displays as "'+ output4 +'"', function(){

      var dateRange = new DateRange( testData.twoDates.differentYear, { lang: 'fr' } );
      var out = dateRange.toString();
      should.exist( out );
      out.should.be.equal( output4 );
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
