"use strict";

const should = require( 'should' );

const mark = require( '../segment-pages/mark' );

describe.only( '02 - markdown (unit)', () => {

  it( 'mark should not process links', () => {

    mark( 'https://openagenda.com' ).should.equal( 'https://openagenda.com' );

  } );

  it( 'mark should not process emails', () => {

    mark( 'support@openagenda.com' ).should.equal( 'support@openagenda.com' );

  } );

  it( 'mark processes markdown', () => {

    mark( '**This is bold**' ).should.equal( '<strong>This is bold</strong>' );

  } );

} );