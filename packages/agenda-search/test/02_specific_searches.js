"use strict";

process.env.NODE_ENV = 'test';

const ih = require( 'immutability-helper' );
const should = require( 'should' );

const config = require( '../testconfig' );

const searchLib = require( '../service/search' );

const agendas = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/fixtures/agendas.json', 'utf-8' ) );

let search;

describe( 'specific searches', function() {

  this.timeout( 10000 );

  before( () => {

    search = searchLib( ih( config, { interfaces : {
      $set: {
        list: async ( query, offset, limit, { detailed } ) => {

          return agendas.slice( offset, offset + limit );

        }
      } }
    } ) );

  } );

  before( () => search.rebuild() );

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
      const agendasUids = agendas.map( a => a.uid ).join( '-' );

      agendasUids.should.equal( '2-4-1' );

      done();

    } );

  } );

} );
