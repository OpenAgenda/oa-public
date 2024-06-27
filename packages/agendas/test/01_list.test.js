"use strict";

process.env.NODE_ENV = 'test';

const async = require( 'async' );
const assert = require('assert');
const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig
} = require( '../testconfig.sample.js' );

const svc = require( '../service/index.js' );

describe( 'agendas - functional (server): list', function () {

  beforeAll( require( './fixtures/load.js' ).bind( null, {
    mysql: config.mysql,
    files: [
      __dirname + '/fixtures/resetDb.sql',
      __dirname + '/../model.sql',
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

  beforeAll( () => {
    svc.init( {
      ...config,
      Files: Files(dConfig.files)
    } )
  } );

  it( 'list as a promise', async () => {

    const { agendas } = await svc.list( 0, 10 );

    expect(agendas.length).toEqual( 10 );

  } );

  it( 'list with offset gets right agenda', done => {

    svc.list( 0, 10, { internal: true }, ( err, agendas ) => {

      svc.list( {}, 4, 1, { internal: true }, ( err, offsetAgendas ) => {

        expect(agendas.length).toEqual( 10 );

        expect(offsetAgendas.length).toEqual( 1 );

        expect(agendas[ 4 ].id).toEqual( offsetAgendas[ 0 ].id );

        done();

      } );

    } );

  } );

  it( 'list with { detailed: true } gets agendas with detailed info', done => {

    svc.list( {}, 94, 1, {
      detailed: true,
      private: null
    }, ( err, agendas ) => {

      expect(agendas[ 0 ].publishedEvents).toEqual( 9 );

      done();

    } );

  } );

  it('list with { offsetAsLastId } option allows for using id value as offset base', async () => {
    const { agendas } = await svc.list({}, 4890, 1, {
      offsetAsLastId: true,
      internal: true
    });

    expect(agendas[0].id).toEqual(4892);
  });

  it('list with { offsetAsLastId } and { order: id.desc } option allows for using id value as offset in reverse id order', async () => {
    const { agendas } = await svc.list({
      order: 'id.desc'
    }, 4890, 1, {
      offsetAsLastId: true,
      internal: true
    });

    expect(agendas[0].id).toEqual(4889);
  });

  it('list with { offsetAsLastId } provides lastId key in result', async () => {
    const { lastId } = await svc.list({}, 4890, 1, {
      offsetAsLastId: true,
      internal: true
    });

    expect(lastId).toEqual(4892);
  });

  it( 'list with { internal: false } does not include internal fields', done => {

    svc.list( {}, 0, 1, {
      internal: false
    }, ( err, agendas ) => {

      expect(Object.keys(agendas[0])).toEqual([
        'locationSetUid',
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
      ]);

      done();

    } );

  } );

  it( 'list with includeImagePath includes full image path', done => {

    svc.list( {}, 0, 1, {
      includeImagePath: true,
      detailed: true
    }, ( err, agendas ) => {
      expect(agendas[ 0 ].image).toEqual( '//openagendatst.s3.amazonaws.com/review_sylvie-et-pascal-verger_00.jpg' );
      done();
    } );

  } );


  it( 'DEPRECATE - list with { detailed: true } gets agendas with detailed info', done => {

    svc.list( {
      detailed: true,
      private: null
    }, 94, 1, ( err, agendas ) => {

      expect(agendas[ 0 ].publishedEvents).toEqual( 9 );

      done();

    } );

  } );

  it( 'onlyIncludeFields option', done => {

    svc.list( {}, 0, 1, {
      onlyIncludeFields: ['uid']
    }, ( err, agendas ) => {

      assert.deepEqual(Object.keys(agendas[0]), ['uid']);

      done();

    } );

  } );


  it( 'default list does not return private agendas', done => {

    svc.list( 85, 10, ( err, agendas ) => {

      // this agenda is private
      expect(agendas.filter( a => a.uid === 54289989 ).length).toEqual( 0 );

      // these aren't
      expect(agendas.filter( a => a.uid === 24821824 ).length).toEqual( 1 );
      expect(agendas.filter( a => a.uid === 17582566 ).length).toEqual( 1 );

      expect(agendas.length).toEqual( 10 );

      done();

    } );

  } );


  it( 'default list returns unindexed agendas', done => {

    svc.list( 0, 30, ( err, agendas ) => {

      expect(agendas.filter( a => a.uid === 90695263 ).length).toEqual( 1 );

      done();

    } );

  } );


  it( 'list with indexed option set to true does not return unindexed agendas', done => {

    svc.list( 0, 30, { indexed: true }, ( err, agendas ) => {

      expect(agendas.filter( a => a.uid === 90695263 ).length).toEqual( 0 );

      done();

    } );

  } );


  it( 'total option at true provides total in result', done => {

    svc.list( 0, 30, { total: true }, ( err, agendas, total ) => {

      expect(total).toEqual( 97 );

      done();

    } );

  } );


  it( 'list with empty ids returns empty list', done => {

    svc.list( { ids: [] }, 0, 10, ( err, agendas ) => {

      expect(agendas.length).toEqual( 0 );

      done();

    } );

  } );


  it( 'list with ids gets agendas', done => {

    svc.list( { ids: [ 4829, 4848 ] }, 0, 2, ( err, agendas ) => {

      expect(agendas.length).toEqual( 2 );

      done();

    } );

  } );

  it('list by uids', async () => {
    const { agendas } = await svc.list({
      uid: 17582566
    }, 0, 1);

    assert.strictEqual(agendas.length, 1)
    assert.strictEqual(agendas[0].uid, 17582566);
  });

  it('list by slugs', async () => {
    const { agendas } = await svc.list({
      slug: 'inaregions'
    }, 0, 1);

    assert.strictEqual(agendas.length, 1)
    assert.strictEqual(agendas[0].slug, 'inaregions');
  });

  it( 'DEPRECATE - list with ids, detailed and search gets agendas', done => {

    svc.list( { ids: [ 4828, 4848 ], detailed: true, private: null, search: 'gradignan' }, 0, 2, ( err, agendas ) => {

      expect(agendas.length).toEqual( 1 );
      expect(agendas[ 0 ].publishedEvents).toEqual( 9 );

      done();

    } );

  } );

  it( 'list with ids, detailed and search gets agendas', done => {

    svc.list( { ids: [ 4828, 4848 ], search: 'gradignan' }, 0, 2, { detailed: true, private: null }, ( err, agendas ) => {

      expect(agendas.length).toEqual( 1 );
      expect(agendas[ 0 ].publishedEvents).toEqual( 9 );

      done();

    } );

  } );


  it( 'list with idGreaterThan limits agendas which have an id greater than a given id', async () => {

    const { agendas } = await svc.list( { idGreaterThan: 4930 }, 0, 10, { internal :true } );

    agendas.map( a => a.id ).forEach( id => {

      expect(( id > 4930 )).toEqual( true );

    } );

  } );


  it( 'list with updatedAtGreaterThan limits agendas to those updated after a given timestamp', done => {

    svc.list( {
      updatedAtGreaterThan: new Date( '2016-01-29T07:55:09.000Z' )
    }, 0, 10, { private: null }, ( err, agendas ) => {

      agendas.forEach( a => {

        expect(( a.updatedAt > new Date( '2016-01-29T07:55:09.000Z' ) )).toEqual( true );

      } );

      done();

    } );

  } );


  it( 'list ordered by createdAt.desc gets newest agenda listed first', done => {

    svc.list( { order: 'createdAt.desc' }, 0, 10, ( err, agendas ) => {

      let prevCreatedAt = agendas[ 0 ].createdAt;

      agendas.forEach( a => {
        expect(a.createdAt.getTime()).toBeLessThanOrEqual(prevCreatedAt.getTime());

        prevCreatedAt = a.createdAt;
      } );

      done();

    } );

  } );


  it( 'list ordered by updatedAt.desc gets latest agendas listed first', done => {

    svc.list( { order: 'updatedAt.desc' }, 0, 10, ( err, agendas ) => {

      let prevUpdatedAt = agendas[ 0 ].updatedAt;

      agendas.forEach( a => {
        expect(
          a.updatedAt.getTime()
        ).toBeLessThanOrEqual(prevUpdatedAt.getTime());

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

      expect(remaining).toEqual( 0 );
      expect(err).toBeNull();

      done();

    } )

  } );

} );
