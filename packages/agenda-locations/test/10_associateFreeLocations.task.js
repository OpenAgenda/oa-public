"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

fixtures = require( './fixtures' ),

afl = require( '../tasks/associateFreeLocations' ),

db = require( '../lib/db' ),

search = require( '../lib/search' ),

config = require( '../testconfig.js' );

describe( 'associateFreeLocations', function() {

  before( done => fixtures( 123, done ) );

  before( done => fixtures( 456, done ) );

  before( done => db.init( config.mysql, {}, done ) );

  before( done => {

    let con = db.getConnection();

    con.query( `update ${config.mysql.table} set agenda_id = null`, err => {

      con.end();

      done();

    });

  } );

  it( 'loops through all locations', ( done ) => {

    let count = 0;

    afl.test._loopThroughAllTheUnassociatedLocations( ( l, lcb ) => {

      count++;

      lcb();

    }, ( err ) => {

      should( err ).equal( null );

      count.should.equal( 151 );

      done();

    } );

  } );

} );
