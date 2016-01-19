"use strict";

var should = require( 'should' ),

validators = require( '../validators' );

describe( 'validators', () => {


  describe.only( 'phone', () => {

    var validate = validators.phone( { field: 'telephone' } );

    it( 'a phone number with spaces is a phone number', () => {

      let clean = validate( '06 50 91 60' );

      clean.should.equal( '06 50 91 60' );

    } );

    it( 'is a phone and is trimmed', () => {

      let clean = validate( ' 06509160 ' );

      clean.should.equal( '06509160' );

    } );

    it( 'is not a phone', () => {

      let caught = false;

      try {

        validate( 'fdsqf' );

      } catch( e ) {

        caught = true;

        e[ 0 ].code.should.equal( 'phone.invalid' );

        e[ 0 ].field.should.equal( 'telephone' ); 

      }

    } );

  } );


  describe( 'email', () => {

    var validate = validators.email( { field: 'email' } );

    it( 'is an email and is trimmed', () => {

      let clean = validate( ' kaore@cibul.net ' );

      clean.should.equal( 'kaore@cibul.net' );

    } );

    it( 'is not an email', () => {

      let caught = false;

      try {

        validate( 'fdsqf' );

      } catch( e ) {

        caught = true;

        e[ 0 ].code.should.equal( 'email.invalid' );

      }

    } );

  } );

  describe( 'link', () => {

    var validate = validators.link( { field: 'link' } );

    it( 'is a link', () => {

      let hasErrs = false;

      try {

        validate( 'https://openagenda.com' );

      } catch( e ) {

        hasErrs = true;

      }

      hasErrs.should.equal( false );

    });

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

  })

  describe( 'text', () => {

    var validate = validators.text( { field: 'text', min: 3, max: 10 } );


    it( 'trims by default', () => {

      let clean = validate( ' pneu ' );

      clean.should.equal( 'pneu' );

    } );


    it( 'wrong type', () => {

      try {

        validate( { grut: 'blip' } );

      } catch( e ) {

        e[ 0 ].code.should.equal( 'string.invalidtype' )

      }

    } );

    it( 'too long', () => {

      try {

        validate( 'fdssqfdsqfdsqfdsq' );

      } catch( e ) {

        e[ 0 ].code.should.equal( 'string.toolong' );

      }

    } );

    it( 'too short', () => {

      try {

        validate( 'fd' );

      } catch( e ) {

        e[ 0 ].code.should.equal( 'string.tooshort' );

      }

    } );

  } );

  describe( 'groupTags', () => {

    var set = {
      groups: [ {
        required: false,
        tags: [ { id: 0, label: 'Tag 0' } ]
      }, {
        required: true,
        tags: [ { id: 1, label: 'Tag 1' }, { id: 2, label: 'Tag 2' } ]
      }, {
        required: true,
        tags: [ { id: 3, label: 'Tag 3' }, { id: 4, label: 'Tag 4' } ]
      } ]
    };


    it( 'validates one group only if index is specified at validation', () => {

      var groupErrors, errors,

      validator = validators.groupTags( set );

      try {

        var tags = validator( [ { id: 11 } ], 2 );

      } catch( e ) {

        groupErrors = e;

      }

      try {

        var tags = validator( [ { id: 11 } ] );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 2 );

      groupErrors.length.should.equal( 1 );

    } );


    it( 'returns errors when required but no tag of selection matches', () => {

      var errors, validator = validators.groupTags( set );

      try {

        var tags = validator( [ { id: 1 } ] );

      } catch( errs ) {

        errors = errs;

      }

      should.exist( errors );

      errors.length.should.equal( 1 );

      errors[ 0 ].code.should.equal( 'groupTags.required' );

    } );

    it( 'returns tags if no errors was detected', () => {

      var errors, validator = validators.groupTags( set );

      try {

        var tags = validator( [ { id: 1 }, { id: 4 } ] );

      } catch( errs ) {

        errors = errs;

      }

      should.not.exist( errors );

    } );

  } );

} );