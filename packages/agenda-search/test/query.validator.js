"use strict";

const should = require( 'should' ),

validators = require( '../validators' );

/**
 * this is a validator created from schemas of the 
 * validator repo, extensive tests are done there.
 * Only few specific tests are done here for documentation
 * purposes
 */

describe( 'validators - query', () => {

  it( 'give it nothing and get default query values', () => {

    validators.query()

    .should.eql( {
      search: null,
      official: null,
      sort: null
    } );

  } );

  it( 'possible values for sort are not random', () => {

    let errors = [];

    try {

      validators.query( {
        sort: 'fqfdsqdf'
      } );

    } catch( e ) { errors = e; }

    errors.should.eql( [ { 
      origin: 'fqfdsqdf',
      field: 'sort',
      code: 'sort.invalid',
      message: 'sort value is not valid' 
    } ] );

  } );

  it( 'sort value can be createdAt.desc', () => {

    validators.query( {
      sort: 'createdAt.desc'
    } )

    .should.eql( {
      search: null,
      official: null,
      sort: 'createdAt.desc'
    } );

  } );

} );