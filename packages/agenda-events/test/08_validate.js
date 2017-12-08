"use strict";

process.env.NODE_ENV = 'test';

const svc = require( '../' );

const config = require( '../testconfig' );

const _ = require( 'lodash' );

const should = require( 'should' );

describe( 'agendaEvents - functional (server): validation', function() {

  before( () => {

    svc.init( config );

  } );

  it( 'base validate endpoint validates data part of an agendaEvent reference', () => {

    svc.validate( {
      state: 2,
      featured: true
    } ).should.eql( {
      state: 2,
      featured: true
    } );

  } );

  it( 'base validate endpoint has a field key as any validators validator would', () => {

    _.keys( svc.validate.fields ).should.eql( [ 'state', 'featured' ] );

  } );

} );