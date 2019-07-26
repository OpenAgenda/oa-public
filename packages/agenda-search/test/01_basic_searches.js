"use strict";

const _ = require( 'lodash' );

const should = require( 'should' );

const config = require( '../testconfig' );

const searchLib = require( '../service/search' );

const listInterface = require( './app/listInterface' );

let search;

describe( 'search', function() {

  this.timeout( 30000 );

  before( () => {

    search = searchLib( _.assign( {
      interfaces: {
        list: listInterface.bind( null, 100 )
      }
    }, config ) );

  } );

  before( () => search.rebuild() );

  it( 'list', done => {

    search.list( {}, 0, 10, ( err, agendas, total ) => {

      total.should.equal( 101 );

      done();

    } );

  } );

  it( 'updates agenda items after given updatedAt', async () => {

    const before = new Date();

    before.setHours( before.getHours() - 1 );

    const result = await search.resyncUpdated( before );

    // capped at 20
    result.should.eql( { indexed: 20, updated: 0 } );

  } );

  it( 'keyword search', done => {

    search.list( { search: 'jardin' }, 0, 10, ( err, agendas, total ) => {

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
