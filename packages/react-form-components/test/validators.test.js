"use strict";

var validators = require( '../validators' );

describe( 'validators', () => {

  describe( 'groupTags', () => {

    var set = {
      groups: [ {
        required: false,
        tags: [ { id: 0, label: 'Tag 0' } ]
      }, {
        required: true,
        tags: [ { id: 1, label: 'Tag 1' }, { id: 2, label: 'Tag 2' } ]
      }, {
        required: true,
        tags: [ { id: 3, label: 'Tag 3' }, { id: 4, label: 'Tag 4' } ]
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

      expect(errors.length).toBe( 2 );

      expect(groupErrors.length).toBe( 1 );

    } );


    it( 'returns errors when required but no tag of selection matches', () => {

      var errors, validator = validators.groupTags( set );

      try {

        var tags = validator( [ { id: 1 } ] );

      } catch( errs ) {

        errors = errs;

      }

      expect(errors.length).toBe( 1 );

      expect(errors[ 0 ].code).toBe( 'groupTags.required' );

    } );

    it( 'returns tags if no errors was detected', () => {

      var errors, validator = validators.groupTags( set );

      try {

        var tags = validator( [ { id: 1 }, { id: 4 } ] );

      } catch( errs ) {

        errors = errs;

      }

      expect(errors).toBeUndefined();

    } );

  } );

} );