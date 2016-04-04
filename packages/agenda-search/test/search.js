"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

config = require( '../testconfig' ),

searchLib = require( '../service/search' ), search,

fixtures = require( './fixtures' ),

agendaTestService = require( './app/agendaTestService' );

describe( 'search', function() {

  this.timeout( 10000 );

  before( () => {

    search = searchLib( agendaTestService, config );

  } );

  before( done => search.rebuild( done ) );

  it( 'list', done => {

    search.list( {}, 0, 10, ( err, agendas, total ) => {

      total.should.equal( 980 );

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