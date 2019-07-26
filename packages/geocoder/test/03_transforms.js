"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );

const applyTransforms = require( '../lib/applyTransforms' );

describe( 'post-geocode transforms', () => {

  it( 'Ecully is in Métropole de Lyon', () => {

    const transformed = applyTransforms( {
      city: 'Ecully'
    } );

    transformed.should.eql( {
      city: 'Ecully',
      department: 'Métropole de Lyon'
    } );

  } );

  it( 'Noisy Lyon is in Métropole de Lyon and is cleaned. Regex transform match', () => {

    const transformed = applyTransforms( {
      city: 'Lyon 8ème'
    } );

    transformed.should.eql( {
      city: 'Lyon',
      department: 'Métropole de Lyon'
    } );

  } );

} );
