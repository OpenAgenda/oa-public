"use strict";

// require( 'debug' ).enable('*');

var should = require( 'should' ),

uLib = require( '../genUrl' );

describe( 'genUrl', function() {

  var genUrl;

  before( function() {

    genUrl = uLib( {
      domain: 'oa.com'
    });

    genUrl.load( {
      simple : '/simple',
      sayHi : '/hi/:name',
      adminHi : '/hello/:name/:surname'
    });

  });

  it( 'unknown path gives #', function() {

    genUrl( 'wigglypoof' ).should.equal( '#' );    

  } );

  it( 'simple call without values gives simple relative url', function() {

    genUrl( 'simple' ).should.equal( '/simple' );

  } );

  it( 'simple call with values should give relative url', function() {

    genUrl( 'sayHi', { name: 'superstar' } ).should.equal( '/hi/superstar' );

  } );

  it( 'more than one value', function() {

    genUrl( 'adminHi', { name: 'super', surname: 'staringsson' }).should.equal( '/hello/super/staringsson' );

  });

  it( 'more than one value in several sets', function() {

    genUrl( 'adminHi', [
      { name: 'super' },
      { surname: 'staringsson' }
    ])

    .should.equal( '/hello/super/staringsson' );

  });

  it( 'absolute url', function() {

    genUrl( 'simple', {}, { abs: true } ).should.equal( 'http://oa.com/simple' );

  });

  it( 'specific protocol', function() {

    genUrl( 'simple', {}, { protocol: 'https://' } ).should.equal( 'https://oa.com/simple' );

  });

  it( 'additional parameters go in the query', function() {

    genUrl( 'sayHi', { name: 'super', surname: 'staringsson', title: 'boss' } )

    .should.equal( '/hi/super?surname=staringsson&title=boss' );

  } );

  it( 'route with ? can have additional query values', function() {

    genUrl.load( { quiz: '/this/:already?has=:aquestionmark' } );

    genUrl( 'quiz', { already: 'onealready', aquestionmark: 'this', additional: 'extra' } )

    .should.equal( '/this/onealready?has=this&additional=extra' );

  });

  it( 'route with variables in camel case is valid', function() {

    genUrl.load( { camel: '/this/:camelCaseVar/yep' } );

    genUrl( 'camel', { camelCaseVar: 'camelcased' } )

    .should.equal( '/this/camelcased/yep' );

  });

} );