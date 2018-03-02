"use strict";

var validate = require( '../lib/validate' ),

should = require( 'should' ),

agendaTestSettings = require( './fixtures/agendaTestSettings.js' );

describe( 'location validator', function() {

  it( 'name is valid', () => {

    try {

      validate( {
        name: 'grut'
      } );

    } catch( errors ) {

      errors.filter( e => e.field == 'name' ).length.should.equal( 0 );

    } 

  } );

  it( 'name is empty string', () => {

    try {

      validate( {
        name: ''
      } );

    } catch( errors ) {

      errors.filter( e => e.field == 'name' )[ 0 ].code.should.equal( 'required' );

    }

  } );

  it( 'name is required', () => {

    try {

      validate( {} );

    } catch( errors ) {

      errors.filter( e => e.field == 'name' )[ 0 ].code.should.equal( 'required' );

    }

  } );

  it( 'coordinates are valid', () => {

    try {

      validate( {
        latitude: 2.45,
        longitude: 13.12
      } );

    } catch( errors ) {

      errors.filter( e => [ 'latitude', 'longitude' ].indexOf( e.field ) !== -1 ).length.should.equal( 0 );

    };

  } );

  it( 'coordinates are not valid', () => {

    try {

      validate( {
        latitude: 99999,
        longitude: '213'
      } );

    } catch( errors ) {

      errors.filter( e => [ 'latitude', 'longitude' ].indexOf( e.field ) !== -1 );

    }

  })

});

describe( 'validator with additional settings', () => {

  it( 'if required tags are not input, throws error', () => {

    var errors = [];

    try {

      clean = validate( {
        agendaId: 123,
        name: 'Neverland',
        address: '123 fantasy road',
        latitude: 0,
        longitude: 0,
        countryCode: 'FR'
      }, agendaTestSettings );

    } catch( e ) {

      errors = e;

    }

    errors.length.should.equal( 1 );

    errors[ 0 ].code.should.equal( 'groupTags.required' );

  } );


  it( 'if required tags are input, validator is happy', () => {

    var errors = [];

    try {

      validate( {
        agendaId: 123,
        name: 'Neverland',
        address: '123 fantasy road',
        latitude: 0,
        longitude: 0,
        tags: [ { id: 33 } ],
        countryCode: 'FR'
      }, agendaTestSettings );

    } catch( e ) {

      errors = e;

    }

    errors.length.should.equal( 0 );

  } );


} );