"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

  config = require( '../testconfig' ),

  searchLib = require( '../service/search' ),

  officialSearchDsl = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/fixtures/official.dsl.json', 'utf-8' ) ),

  agendaTestService = require( './app/agendaTestService' ),

  elasticsearch = require( 'elasticsearch' );

  let search;

/*describe( 'search', function() {

  this.timeout( 20000 );

  before( () => {

    search = searchLib( agendaTestService, config );

  } );

  before( done => search.rebuild( done ) );

  it( 'dsl search', async () => {

    const client = searchLib.getClient();

    const result = await client.search( {
      index: 'agenda_test',
      type: 'agenda',
      body: officialSearchDsl
    } );

    result.hits.total.should.equal( 94 );

  } );

} );*/