"use strict";

process.env.NODE_ENV = 'test';

const svc = require( '../' );

const config = require( '../testconfig' );

const should = require( 'should' );

const fixtures = require( './fixtures' );

const mysql = require( 'mysql' );

const _ = require( 'lodash' );

describe( 'remove agenda_event references', () => {

  beforeEach( () => {

    svc.init( config );

  } );

  beforeEach( done => {

    fixtures( config, [ 'agenda_event' ], done );

  } );

  
  it( 'simple remove', done => {

    svc( 4608 ).remove( 81652, ( err, result ) => {

      should( err ).equal( null );

      _.keys( result ).should.eql( [ 'success', 'found', 'removed' ] );

      result.success.should.equal( true );

      result.found.should.equal( true );

      _.omit( result.removed, [ 'createdAt', 'updatedAt' ] )

        .should.eql( {
          id: 3,
          agendaId: 4608,
          eventId: 81652,
          state: 1,
          featured: 0
        } );

      done();

    } );

  } );


  it( 'remove decreases reference count by one', done => {

    let con = mysql.createConnection( config.mysql );

    con.query( `select count(id) from ${config.schemas.agendaEvent}`, ( err, before ) => {

      svc( 4608 ).remove( 81652, ( err, result ) => {

        con.query( `select count(id) from ${config.schemas.agendaEvent}`, ( err, after ) => {

          before[ 0 ][ 'count(id)' ].should.equal( after[ 0 ][ 'count(id)' ] + 1 );

          done();

        } );

      } );

    } );

  } );
  

  it( 'onRemove interface method is called when defined', done => {

    let removed;

    svc.init( _.extend( {}, config, { interfaces: {
      onRemove: r => {

        removed = r;

      } 
    } } ) );

    svc( 4608 ).remove( 81652, ( err, result ) => {

      removed.should.eql( result.removed );

      done();

    } );

  } );

} );