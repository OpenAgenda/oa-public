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
      featured: true,
      userUid: null
    } );

  } );

  it( 'base validate endpoint has a field key as any validators validator would', () => {

    _.keys( svc.validate.fields ).should.eql( [ 'state', 'featured', 'userUid' ] );

  } );

  it( 'validate endpoint assigns default state value when it is unspecified', () => {

    svc.validate( {
      featured: true
    } ).should.eql( {
      state: 2,
      featured: true,
      userUid: null
    } );

  } );

  it( 'validate endpoint does not include state if not provided and optional state option is set', () => {

    svc.validate( {
      featured: true
    }, { optionalStateAndFeatured: true } ).should.eql( {
      featured: true,
      userUid: null
    } );

  } );

  it( 'validate can do things partially', () => {

    svc.validate( {
      state: 0
    }, { partial: true } ).should.eql( {
      state: 0
    } );

  } );

} );
