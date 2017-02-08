"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

  // service loaded with test lib
  svc = require( '../service/test' ),

  async = require( 'async' ),

  config = require( '../testconfig' );

describe( 'agendas - functional (server): list', function () {

  this.timeout( 30000 );

  before( () => {
    svc.init( config )
  } );

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

    svc.list( {}, 94, 1, {
      detailed: true,
      private: null
    }, ( err, agendas ) => {

      agendas[ 0 ].publishedEvents.should.equal( 9 );

      done();

    } );

  } );


  it( 'DEPRECATE - list with { detailed: true } gets agendas with detailed info', done => {

    svc.list( {
      detailed: true,
      private: null
    }, 94, 1, ( err, agendas ) => {

      agendas[ 0 ].publishedEvents.should.equal( 9 );

      done();

    } );

  } );


  it( 'default list does not return private agendas', done => {

    svc.list( 85, 10, ( err, agendas ) => {

      // this agenda is private
      agendas.filter( a => a.uid === 54289989 ).length.should.equal( 0 );

      // these aren't
      agendas.filter( a => a.uid === 24821824 ).length.should.equal( 1 );
      agendas.filter( a => a.uid === 17582566 ).length.should.equal( 1 );

      agendas.length.should.equal( 10 );

      done();

    } );

  } );


  it( 'list with ids gets agendas', done => {

    svc.list( { ids: [ 4829, 4848 ] }, 0, 2, ( err, agendas ) => {

      agendas.length.should.equal( 2 );

      done();

    } );

  } );


  it( 'DEPRECATE - list with ids, detailed and search gets agendas', done => {

    svc.list( { ids: [ 4828, 4848 ], detailed: true, private: null, search: 'gradignan' }, 0, 2, ( err, agendas ) => {

      agendas.length.should.equal( 1 );
      agendas[ 0 ].publishedEvents.should.equal( 9 );

      done();

    } );

  } );

  it( 'list with ids, detailed and search gets agendas', done => {

    svc.list( { ids: [ 4828, 4848 ], search: 'gradignan' }, 0, 2, { detailed: true, private: null }, ( err, agendas ) => {

      agendas.length.should.equal( 1 );
      agendas[ 0 ].publishedEvents.should.equal( 9 );

      done();

    } );

  } );


  it( 'list ordered by createdAt.desc gets newest agenda listed first', done => {

    svc.list( { order: 'createdAt.desc' }, 0, 10, ( err, agendas ) => {

      let prevCreatedAt = agendas[ 0 ].createdAt;

      agendas.forEach( a => {

        a.createdAt.should.be.belowOrEqual( prevCreatedAt );

        prevCreatedAt = a.createdAt;

      } );

      done();

    } );

  } );


  it( 'list ordered by updatedAt.desc gets latest agendas listed first', done => {

    svc.list( { order: 'updatedAt.desc' }, 0, 10, ( err, agendas ) => {

      let prevUpdatedAt = agendas[ 0 ].updatedAt;

      agendas.forEach( a => {

        a.updatedAt.should.be.belowOrEqual( prevUpdatedAt );

        prevUpdatedAt = a.updatedAt;

      } );

      done();

    } );

  } );


  it( 'a few lists do not leak db connections', done => {

    let remaining = 400;

    async.whilst( () => remaining, wcb => {

      svc.list( 0, 10, ( err, agendas, total ) => {

        remaining--;

        wcb( err );

      } );

    }, err => {

      remaining.should.equal( 0 );

      should( err ).equal( null );

      done();

    } )

  } );

} );