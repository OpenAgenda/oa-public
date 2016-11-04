"use strict";

const svc = require( '../service/test' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'list events', function() {

  this.timeout( 5000 );

  before( () => {

    svc.init( config );

  } );

  beforeEach( done => {

    svc.test.fixtures( [
      config.schemas.event
    ], done );

  } );

  it( 'simple list', done => {

    svc.list( 0, 5, ( err, events ) => {

      should( err ).equal( null );

      events.length.should.equal( 5 );

      done();

    } );

  } );


  it( 'base list does not include draft or private events', done => {

    svc.list( 0, 20, ( err, events ) => {

      events.filter( e => e.private ).length.should.equal( 0 );

      events.filter( e => e.draft ).length.should.equal( 0 );

      done();

    } );

  } );


  it( 'list with private to true gets private events only', done => {

    svc.list( { private: true }, 0, 20, ( err, events ) => {

      events.filter( e => e.private ).length.should.equal( events.length );

      done();

    } );

  } );

  it( 'list with private to null gets both private and non private events', done => {

    svc.list( { private: null }, 0, 20, ( err, events ) => {

      events.filter( e => !e.private ).length.should.not.equal( 0 );

      events.filter( e => e.private ).length.should.not.equal( 0 );

      done();

    } );

  } );

} );