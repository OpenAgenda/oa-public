"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

config = require( '../testconfig' ),

searchLib = require( '../service/search' ), search,

agendaTestService = require( './app/agendaTestService' );

describe( 'search', function() {

  this.timeout( 20000 );

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


  it( 'official filter: all retrieved agendas are official', done => {

    search.list( { search: 'title', official: true }, 0, 10, ( err, agendas, total ) => {

      agendas.filter( a => !a.official ).length.should.equal( 0 );

      done();

    } );

  } );

} );