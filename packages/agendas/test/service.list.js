"use strict";

var should = require( 'should' ),

// service loaded with test lib
svc = require( '../service/test' ),

config = require( '../testconfig' );

describe( 'list', () => {

  before( () => { svc.init( config ) } );

  before( svc.test.fixtures );

  it( 'list with offset gets right agenda', done => {

    svc.list( 0, 10, ( err, agendas ) => {

      svc.list( {}, 4, 1, ( err, offsetAgendas ) => {

        agendas.length.should.equal( 10 );

        offsetAgendas.length.should.equal( 1 );

        agendas[ 4 ].id.should.equal( offsetAgendas[ 0 ].id );

        done();

      } );

    } );

  } );


  it( 'list with { detailed: true } gets agendas with detailed info', done => {

    svc.list( { detailed: true }, 10, 2, ( err, agendas ) => {

      agendas[ 0 ].publishedEvents.should.equal( 9 );

      done();

    } );

  } );

} );