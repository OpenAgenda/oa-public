"use strict";

process.env.NODE_ENV = 'test';

const async = require( 'async' );
const should = require( 'should' );

const config = require( '../testconfig' );

const svc = require( '../' );

describe( 'agendas - functional (server): list', function () {

  this.timeout( 30000 );

  before( require( './fixtures/load.js' ).bind( null, {
    mysql: config.mysql,
    files: [
      __dirname + '/fixtures/resetDb.sql',
      __dirname + '/../agenda.sql',
      __dirname + '/fixtures/agenda.data.sql',
      __dirname + '/fixtures/agendaEvent.data.sql',
      __dirname + '/fixtures/occurrence.data.sql'
    ],
    map: {
      database: config.mysql.database,
      agenda: 'agenda',
      agendaEvent: 'agenda_event',
      occurrence: 'occurrence'
    }
  } ) );

  before( () => {
    svc.init( config )
  } );

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

  it( 'list with { internal: false } does not include internal fields', done => {

    svc.list( {}, 0, 1, {
      internal: false
    }, ( err, agendas ) => {

      Object.keys( agendas[ 0 ] ).should.eql( [
        'slug',
        'uid',
        'official',
        'title',
        'description',
        'url',
        'image',
        'updatedAt',
        'createdAt',
        'private',
        'indexed'
      ] );

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

  it( 'default list returns unindexed agendas', done => {

    svc.list( 0, 10, ( err, agendas ) => {

      agendas.filter( a => a.uid === 35338076 ).length.should.equal( 1 );

      done();

    } );

  } );


  it( 'list with indexed option set to false does not return indexed agendas', done => {

    svc.list( 0, 10, { indexed: false }, ( err, agendas ) => {

      agendas.filter( a => a.uid === 35338076 ).length.should.equal( 0 );

      done();

    } );

  } );


  it( 'list with empty ids returns empty list', done => {

    svc.list( { ids: [] }, 0, 10, ( err, agendas ) => {

      agendas.length.should.equal( 0 );

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


  it( 'list with updatedAtGreaterThan limits agendas to those updated after a given timestamp', done => {

    svc.list( {
      updatedAtGreaterThan: new Date( '2016-01-29T07:55:09.000Z' )
    }, 0, 10, { private: null }, ( err, agendas ) => {

      agendas.forEach( a => {

        ( a.updatedAt > new Date( '2016-01-29T07:55:09.000Z' ) ).should.equal( true );

      } );

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