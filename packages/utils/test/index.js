"use strict";

const should = require( 'should' ),

utils = require( '../' );

describe( 'utils', () => {

  describe( 'capitalize', () => {

    it( 'ok', () => {

      utils.capitalize( 'capthis' )

      .should.equal( 'Capthis' );

    } );

    it( 'capitalize bad input', () => {

      utils.capitalize( '' )

      .should.equal( '' );

    } );

    it( 'not a string', () => {

      utils.capitalize( 34 )

      .should.equal( '34' );

    } );

  } );

} );
