"use strict";

const should = require( 'should' );
const db = require( '../service/db' );
const config = require( '../testconfig' );
const fixtures = require( 'fixtures' );
const dropDatabaseIfExists = require( 'mysql-utils/dropDatabaseIfExists' );
const mysql = require( 'mysql' );


describe( 'agenda-event-references - db', function() {

  this.timeout( 10000 );

  beforeEach( done => {

    dropDatabaseIfExists( {
      config: config.mysql,
      database: config.mysql.database
    }, done );
    
  } );

  beforeEach( done => {

    fixtures.init( { mysql: config.mysql, schemas: { a: config.schema } } );

    fixtures( [ {
      table: 'a',
      src: __dirname + '/fixtures.sql'
    } ], done );

  } );

  beforeEach( done => {

    db.init( config, done );

  } );

  it( 'db.get - gets references of an agendaEvent', done => {

    db.get( 1, 101, ( err, refEventIds ) => {

      should( err ).equal( null );

      refEventIds.should.eql( [ 1100, 1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109 ] );

      done();

    } );

  } );

  it( 'db.clear - removes all references from an agendaevent', done => {

    let con = mysql.createConnection( config.mysql );

    con.query( `select * from ${config.schema} where agenda_id = ? and event_id = ?`, [ 1, 100 ], ( err, rows ) => {

      rows.length.should.equal( 10 );

      db.clear( 1 /*agendaId*/, 100 /*eventId*/, err => {

        con.query( `select * from ${config.schema} where agenda_id = ? and event_id = ?`, [ 1, 100 ], ( err, rows ) => {

          rows.length.should.equal( 0 );

          con.end();

          done();

        } )

      } );

    } );

  } );

  it( 'db.set - sets references for an agendaevent', done => {

    db.set( 123 , 999, [ 1, 2, 3, 4 ], ( err, entries ) => {

      should( err ).equal( null );

      entries.should.eql( [ 1, 2, 3, 4 ] );

      done();

    } );

  } );

  it( 'db.set - replaces references for new set values', done => {

    db.set( 1, 100, [ 123 ], err => {

      should( err ).equal( null );

      db.get( 1, 100, ( err, refIds ) => {

        refIds.should.eql( [ 123 ] );

        done();

      } );

    } );

  } );

} );


