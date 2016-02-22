"use strict";

var should = require( 'should' ),

db = require( '../service/db' ),

config = require( '../testconfig' ),

searchLib = require( '../service/search' ), search,

fixtures = require( './fixtures' );

describe( 'search', () => {

  before( fixtures );

  before( () => db.init( config ) );

  before( () => {

    search = searchLib( db, config );

  } );

  before( done => search.rebuild( done ) );

  it( 'list', done => {

    search.list( {}, 0, 10, ( err, agendas, total ) => {

      total.should.equal( 102 );

      done();

    } );

  } );

  it( 'keyword search', done => {

    search.list( { search: 'jardin' }, 0, 10, ( err, agendas, total ) => {

      total.should.equal( 2 );

      done();

    });

  } );

} );