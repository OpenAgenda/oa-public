"use strict";

const svc = require( '../service/test' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'set: update an event', function() {

  this.timeout( 5000 );

  let id;

  before( () => {

    svc.init( config );

  } );

  beforeEach( done => {

    svc.test.fixtures( [
      config.schemas.event + '_empty'
    ], done );

  } );

  beforeEach( done => {

    svc.set( {
      title: {
        fr: 'My first event'
      }
    }, { internal: true }, ( err, result ) => {

      id = result.event.id;

      done();

    } );

  } );

  it( 'update the event title', done => {

    svc.set( id, { title: {
      fr: 'Titre à jour'
    } }, ( err, result ) => {

      should( err ).equal( null );

      result.success.should.equal( true );

      result.event.title.should.eql( {
        fr: 'Titre à jour'
      } );

      done();

    } )

  } );

  it( 'invalid title update', done => {

    svc.set( id, { title: {} }, ( err, result ) => {

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

} );