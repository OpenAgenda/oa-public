"use strict";

const should = require( 'should' );

const { isSuperiorTo, isSuperiorToOrEqual, isEqualTo, isLessThan } = require( '../' ).utils.compareRoles;

describe( 'members - utils - compareRoles', () => {

  describe( 'isSuperiorTo', () => {

    it( 'works with roles as integers', () => {
      const administrator = 2;
      const moderator = 3;

      isSuperiorTo( administrator, moderator ).should.equal( true );
    } );

    it( 'works with roles as smallcase strings', () => {
      isSuperiorTo( 'administrator', 'moderator' ).should.equal( true );
    } );

    it( 'works with mixed', () => {
      isSuperiorTo( 'administrator', 3 ).should.equal( true );
      isSuperiorTo( 3, 'administrator' ).should.equal( false );
    } );

    it( 'works with roles as uppercase strings', () => {
      isSuperiorTo( 'ADMINISTRATOR', 'MODERATOR' ).should.equal( true );
    } );

    it( 'administrator is superior to moderator', () => {
      isSuperiorTo( 'administrator', 'moderator' ).should.equal( true );
    } );

    it( 'moderator is not superior to administrator', () => {
      isSuperiorTo( 'moderator', 'administrator' ).should.equal( false );
    } );

    it( 'moderator is not superior to moderator', () => {
      isSuperiorTo( 'moderator', 'moderator' ).should.equal( false );
    } );

    it( 'undefined or null is not superior to reader', () => {
      isSuperiorTo( undefined, 'reader' ).should.equal( false );
    } );

    it( 'Unknown error is thrown if given string is unknown', () => {
      let error;

      try {
        isSuperiorTo( 'ADMINISTRATOR', 'CLOWN' );
      } catch ( e ) {
        error = e;
      }

      error.message.should.equal( 'Unknown role: CLOWN' );
    } );

  } );

  describe( 'isLessThan', () => {

    it( 'moderator is less than administrator', () => {
      isLessThan( 'moderator', 'administrator' ).should.equal( true );
    } );

    it( 'moderator is not less than reader', () => {
      isLessThan( 'moderator', 'reader' ).should.equal( false );
    } );

    it( 'null is less than reader', () => {
      isLessThan( null, 'reader' ).should.equal( true );
    } );

  } );

  describe( 'isSuperiorToOrEqual', () => {

    it( 'moderator is superior or equal to moderator', () => {
      isSuperiorToOrEqual( 'moderator', 'moderator' ).should.equal( true );
    } )

    it( 'moderator is not superior to or equal to administrator', () => {
      isSuperiorToOrEqual( 'moderator', 'administrator' ).should.equal( false );
    } );

  } );

  describe( 'isEqualTo', () => {

    it( 'contributor is equal to contributor', () => {
      isEqualTo( 'contributor', 'contributor' ).should.equal( true );
    } );

    it( 'contributor is not equal to reader', () => {
      isEqualTo( 'contributor', 'reader' ).should.equal( false );
    } );

  } );

} );
