"use  strict";

var should = require( 'should' ),

lUtils = require( '../languageUtils' );

describe( 'languageUtils', () => {

  describe( 'getSwapIndex', () => {

    it( 'it finds the swapped index', () => {

      lUtils.getSwapIndex( [ 'd', 'z', 'a', 'e' ], [ 'd', 'z', 't', 'e' ] )

      .should.equal( 2 );

    } );

    it( 'does not consider more than one swap', () => {

      lUtils.getSwapIndex( [ 'f', 'd', 's', 'p' ], [ 'f', 'd', 'z', 'o' ] )

      .should.equal( -1 );

    } );

    it( 'does not consider different sizes', () => {

      lUtils.getSwapIndex( [ 'f', 'd', 's' ], [ 'f', 'd' ] )

      .should.equal( -1 );

    } );

    it( 'gives -1 when no swap is observed', () => {

      lUtils.getSwapIndex( [ 'f', 'd' ], [ 'f', 'd' ] )

      .should.equal( -1 );

    } );

  } );

} );