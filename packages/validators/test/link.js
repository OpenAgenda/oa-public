"use strict";

var should = require( 'should' ),

validators = require( '../' );

describe( 'link validator', () => {

  describe( 'required ( default )', () => {

    var validate = validators.link( { field: 'link', optional: false } );

    it( 'an email is not a link', () => {

      let errors = [];

      try {

        validate( 'email@gmail.com' );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 1 );

    } );


    it( 'an empty input is not a link', () => {

      let errors = [];

      try {

        validate();

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 1 );

    } );


    it( 'http is added if missing', () => {

      var clean = validate( 'lemonde.fr' );

      clean.should.equal( 'http://lemonde.fr' );

    } );


    it( 'is a link', () => {

      let hasErrs = false;

      try {

        validate( 'https://openagenda.com' );

      } catch( e ) {

        hasErrs = true;

      }

      hasErrs.should.equal( false );

    } );


    it( 'not a link', () => {

      var caught = false;

      try {

        validate( 'fsqfsdq' );

      } catch( e ) {

        caught = true;

        e[ 0 ].code.should.equal( 'link.invalid' );

      }

      caught.should.equal( true );

    } );

  } );

  describe( 'optional', () => {

    var validate = validators.link( { field: 'link', optional: true } );

    it( 'empty input is ignored', () => {

      should( validate() )

      .equal( undefined );

    } );

    it( 'link validator is optional by default', () => {

      let errors = []

      try {

        validators.link()();

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 0 );

    } );

  } );

} );