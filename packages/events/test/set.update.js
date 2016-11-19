"use strict";

const svc = require( '../service/test' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'set: update an event', function() {

  this.timeout( 5000 );

  let id = 146173;

  before( () => {

    svc.init( config );

  } );

  beforeEach( done => {

    svc.test.fixtures( [
      config.schemas.event
    ], done );

  } );

  it( 'update the event title', done => {

    svc.set( id, {
      title: {
        fr: 'Titre à jour'
      }
    }, ( err, result ) => {

      should( err ).equal( null );

      result.success.should.equal( true );

      result.event.title.should.eql( {
        fr: 'Titre à jour'
      } );

      done();

    } );

  } );


  it( 'absent title is considered invalid for non draft event', done => {

    svc.set( id, { title: {} }, { draft: false }, ( err, result ) => {

      result.success.should.equal( false );

      result.errors.should.eql( [ { 
        field: 'title',
        code: 'required',
        message: 'at least one language entry is required',
        origin: {} 
      } ] );

      done();

    } );

  } );


  it( 'absent title is considered valid for draft event', done => {

    svc.set( id, { title: {} }, { draft: true }, ( err, result ) => {

      result.success.should.equal( true );

      done();

    } );

  } );


  it( 'updating with timings', done => {

    svc.set( id, {
      timings: [ {
        begin: new Date( '2017-10-24T20:00:00' ),
        end: new Date( '2017-10-24T22:00:00' )
      } ]
    }, ( err, result ) => {

      should( err ).equal( null );

      result.success.should.equal( true );

      result.event.timings.length.should.equal( 1 );

      done();

    } );

  } );


  it( 'an updated with internal boolean to true gives back "internal" fields', done => {

    svc.set( id, {
      "conditions" : "Its free!"
    }, { internal: true }, ( err, result ) => {

      result.success.should.equal( true );

      result.event.id.should.equal( id );

      done();      

    } );

  } );


  it( 'a default update gives back event data excluding "internal" fields', done => {

    svc.set( id, {
      "accessibility" : {
        "hi" : true
      }
    }, ( err, result ) => {

      result.success.should.equal( true );

      should( result.id ).equal( undefined );

      done();

    } );

  } );

} );