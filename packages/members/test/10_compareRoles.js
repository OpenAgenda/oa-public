"use strict";

const should = require( 'should' );

const { isSuperiorTo } = require( '../' ).utils.compareRoles;

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

    it( 'moderator is superior or equal to moderator', () => {
      isSuperiorTo( 'moderator', 'moderator', true ).should.equal( true );
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

} );
