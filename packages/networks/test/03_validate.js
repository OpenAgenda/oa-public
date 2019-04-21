"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const Service = require( '../' );

const validate = Service.validate; // can be called through instance too

describe( 'networks - functional ( server ): validate', function() {

  it( 'validate requires all fields', () => {

    _.keys( validate( {
      id: 1,
      uid: 123,
      title: 'La Baule',
      createdAt: new Date(),
      updatedAt: new Date()
    } ) ).should.eql( [ 'id', 'uid', 'title', 'createdAt', 'updatedAt' ] );

  } );

} );
