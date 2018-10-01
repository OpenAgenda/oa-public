"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

  config = require( '../testconfig' ),

  searchLib = require( '../service/search' ),

  agendas = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/fixtures/agendas.json', 'utf-8' ) ),

  ih = require( 'immutability-helper' );

let search;

describe( 'specific searches', function() {

  this.timeout( 10000 );

  before( () => {

    search = searchLib( {}, ih( config, { interfaces : {
      $set: {
        agendasList: ( offset, limit, cb ) => {

          cb( null, agendas.slice( offset, offset + limit ) );

        }
      } }
    } ) );

  } );

  before( done => search.rebuild( done ) );

  it( 'fetch all', done => {

    search.list( {}, 0, 10, ( err, agendas, total ) => {

      total.should.equal( 4 );

      done();

    } );

  } );


  it( 'fetch by search on title', done => {

    search.list( { search: 'Ville' }, 0, 10, ( err, agendas, total ) => {

      total.should.equal( 1 );

      done();

    } );

  } );

  it( 'fetch official only', done => {

    search.list( { official: true }, 0, 10, ( err, agendas, total ) => {

      total.should.equal( 3 );

      done();

    } );

  } );

  it( 'match search on keyword', done => {

    search.list( { search: 'France' }, 0, 10, ( err, agendas, total ) => {

      total.should.equal( 1 );

      agendas[ 0 ].title.should.equal( 'Au Théâtre ce soir' );

      done();

    } );

  } );

  it( 'official search sorts by officialized timestamp', done => {

    search.list( { official: true }, 0, 10, ( err, agendas ) => {

      let agendasUids = agendas.sort( ( a, b ) => a.officializedAt > b.officializedAt ? 1 : - 1 ).map( a => a.uid ).join( '-' );

      agendasUids.should.equal( '4-2-1' );

      done();

    } );

  } );

} );