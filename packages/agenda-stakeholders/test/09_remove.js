"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );
const config = require( '../testconfig' );
const mysql = require( 'mysql' );
const service = require( './service' );

describe( 'agenda-stakeholders - functional (server): remove', function() {

  this.timeout( 60000 );

  before( done => {

    service.initAndLoad( config, done );

  } );

  it( 'remove with id removes stakeholder of said id', done => {

    service.agenda( 4608 ).remove( { id: 6975 }, ( err, result ) => {

      result.success.should.equal( true );

      done();

    } );

  } );

  it( 'remove removes from db', done => {

    service.agenda( 4608 ).get( { id: 6976 }, ( err, stakeholder ) => {

      stakeholder.should.not.equal( null );

      service.agenda( 4608 ).remove( { id: 6976 }, () => {

        service.agenda( 4608 ).get( { id: 6976 }, ( err, stakeholder ) => {

          should( stakeholder ).equal( null );

          done();

        } );

      } );

    } );

  } );

  it( 'remove with userId does works too', done => {

    service.agenda( 4608 ).remove( { userId: 7348 }, ( err, result ) => {

      result.success.should.equal( true );

      done();

    } );

  } );

  it( 'remove inexistant stakeholder gives a result with success at false', done => {

    service.agenda( 4608 ).remove( { id: 78438927 }, ( err, result ) => {

      result.success.should.equal( false );

      done();

    } );

  } );

} );