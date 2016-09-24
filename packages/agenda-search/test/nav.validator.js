"use strict";

const should = require( 'should' ),

validators = require( '../validators' );

describe( 'validators - nav', () => {

  it( 'give it nothing and get default nav values', () => {

    let n = validators.nav();

    n.should.eql( {
      page: 1,
      offset: 0,
      limit: 20
    } );

  } );

  it( 'give it a page only and get all nav values', () => {

    let n = validators.nav( { page: 2 } )

    n.should.eql( {
      page: 2,
      offset: 20,
      limit: 20
    } );

  } );

  it( 'give it an offset and get all nav values', () => {

    validators.nav( { offset: 20 } )

    .should.eql( {
      page: 2,
      offset: 20,
      limit: 20
    } );

  } );

} )