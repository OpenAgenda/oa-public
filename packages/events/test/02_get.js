"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'events - functional (server): get', function() {

  this.timeout( 5000 );

  beforeEach( done => {

    svc.initAndLoad( config, done );

  } );

  afterEach( done => {

    svc.getConfig().knex.destroy( done );

  } );

  it( 'simple get', done => {

    svc.get( 146173, ( err, event ) => {

      event.slug.should.equal( 'a-fancy_194' );

      done();

    } )

  } );

  it( 'a get by uid', done => {

    svc.get( { uid: 3564473 }, ( err, event ) => {

      event.slug.should.equal( 'a-fancy_194' );

      done();

    } );

  } );

  it( 'it is not possible to get a deleted event', done => {

    svc.get( 147352, ( err, event ) => {

      should( event ).equal( null );

      done();

    } );

  } );

  it( 'a private event is not accessible with default get', done => {

    svc.get( 146007, ( err, event ) => {

      should( event ).equal( null );

      done();

    } );

  } );

  it( 'a public event is not accessible if private option is set to true', done => {

    svc.get( 147352, { private: true }, ( err, event ) => {

      should( event ).equal( null );

      done();

    } );

  } );

  it( 'a private event is accessible if private option is set to true', done => {

    svc.get( 146007, { private: true }, ( err, event ) => {

      event.slug.should.equal( 'a-la-decouverte-d-activites-numeriques-innovantes' );

      done();

    } );

  } );

  it( 'a private event is accessible if private option is set to null', done => {

    svc.get( 146007, { private: null }, ( err, event ) => {

      event.slug.should.equal( 'a-la-decouverte-d-activites-numeriques-innovantes' );

      done();

    } );

  } );

  it( 'a public event is accessible if private option is set to null', done => {

    svc.get( 146173, { private: null }, ( err, event ) => {

      event.slug.should.equal( 'a-fancy_194' );

      done();

    } );

  } );


  it( 'a erroneous json get gives back an error', done => {

    svc.get( 146318, ( err, event ) => {

      should( err ).not.equal( null );

      should( event ).equal( undefined );

      done();

    } );

  } );

} );