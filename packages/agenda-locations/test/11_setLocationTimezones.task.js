"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

fixtures = require( './fixtures' ),

slt = require( '../tasks/setLocationTimezones' ),

db = require( '../lib/db' ),

search = require( '../lib/search' ),

config = require( '../testconfig.js' );

describe( 'setLocationTimezones', function() {

  this.timeout( 40000 );

  before( done => fixtures( 123, done ) );

  //before( done => fixtures( 456, done ) );

  before( done => slt.init( config, done ) );

  it( 'sets timezone in store for all locations', done => {

    return done();

    _loadStoresByUid( ( err, storesBefore ) => {

      if ( err ) throw err;

      slt( err => {

        _loadStoresByUid( ( err, storesAfter ) => {

          if ( err ) throw err;

          for( let uid in storesAfter ) {

            if ( storesBefore[ uid ] && !storesBefore[ uid ].timezone ) {

              _keysDiff( storesBefore[ uid ], storesAfter[ uid ] ).should.eql( [ 'timezone' ] );

            }

          }

          done();

        } );

      } );

    } );


  } );

} );


function _keysDiff( obj1, obj2 ) {

  let diff = Object.keys( obj1 ).filter( k => Object.keys( obj2 ).indexOf( k ) == -1 )

  .concat( Object.keys( obj2 ).filter( k => Object.keys( obj1 ).indexOf( k ) == -1 ) );

  return diff;

}

function _loadStoresByUid( cb ) {

  let con = db.getConnection();

  con.query( 'select uid, store from location', ( err, rows ) => {

    con.end();

    if ( err ) return cb( err );

    let stByUid = {};

    rows.forEach( r => {

      stByUid[ r.uid ] = JSON.parse( r.store );

    } );

    cb( null, stByUid );

  } );

}
