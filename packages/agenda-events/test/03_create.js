"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const config = require( '../testconfig' );

const mysql = require( 'mysql' );

const _ = require( 'lodash' );

const im = require( 'immutability-helper' );

const should = require( 'should' );

describe( 'agendaEvents - functional (server): create', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  afterEach( () => {

    svc.init( config );

  } );

  describe('simple create', () => {
    let rows;
    let result;

    before(done => {
      svc(1111).create(2222).then(r => {
        result = r;
        const con = mysql.createConnection(config.mysql);

        con.query('select * from agenda_event where agenda_uid = ? and event_uid = ?', [1111, 2222], (err, r) => {
          rows = r;
          done();
        });
      });
    });

    it('one entry in db is created', () => {
      rows.length.should.equal(1);
    });

    it('entry has specified agenda and event references', () => {
      _.pick(rows[0], ['agenda_uid', 'event_uid']).should.eql({
        agenda_uid: 1111,
        event_uid: 2222
      });
    });

    it('aggregated db field is false by default', () => {
      rows[0].aggregated.should.equal(0);
    });

    it('created result specifies aggregated to be false', () => {
      result.created.aggregated.should.equal(false);
    });

  });

  describe('create with some more values', () => {
    const result = {};

    before(async () => {
      result.byUser = await svc(1212).create(3434, {
        userUid: 5656
      });

      result.aggregated = await svc(1212).create(9893, {
        aggregated: true
      });

      result.aggregatedAndUser = await svc(1212).create(19390, {
        aggregated: true,
        userUid: 1929
      });
    });

    it('userUid is provided in created ref', () => {
      result.byUser.created.userUid.should.equal(5656);
    });

    it('aggregated is provided in created ref as true when specified', () => {
      result.aggregated.created.aggregated.should.equal(true);
    });

    it('cannot create an entry both as aggregated and associated with user', () => {
      result.aggregatedAndUser.success.should.equal(false);
    });

  });

  it( 'simple create forcing timestamp values', async () => {

    const createdAt = new Date( '2017-02-28T08:00:00.000Z' );

    const updatedAt = new Date( '2017-03-28T08:00:00.000Z' );

    const result = await svc( 62792452 ).create( 3333, {
      featured: true,
      state: 2,
      createdAt,
      updatedAt
    }, { protected: false } );

    result.created.createdAt.toString().should.equal( createdAt.toString() );

    result.created.updatedAt.toString().should.equal( updatedAt.toString() );

  } );

  it( 'context can be passed in options to be transfered to onCreate interface', done => {

    svc.init( im( config, {
      interfaces: {
        onCreate: {
          $set: ( created, context ) => {

            context.should.eql( {
              userUid: 111,
              aggregated: false,
              agendaUid: null,
              transferToLegacy: false,
              agenda: null,
              sourceAgenda: null,
              event: null,
              legacy: true,
              batched: false
            } );

          }
        }
      }
    } ) );

    svc( 1212 ).create( 3445, {}, {
      context: {
        userUid: 111
      }
    } ).then( () => done() );

  } );


  it( 'when no context is passed, default context values are given', done => {

    svc.init( im( config, {
      interfaces: {
        onCreate: {
          $set: ( created, context ) => {

            context.should.eql( {
              userUid: null,
              aggregated: false,
              sourceAgenda: null,
              transferToLegacy: false,
              agenda: null,
              event: null,
              legacy: true
            } );

          }
        }
      }
    } ) )

    svc( 1212 ).create( 3445 ).then( () => done() );

  } );


  it( 'set canEdit to true in second create argument', async () => {

    const { created } = await svc( 1212 ).create( 3446, { canEdit: true } );

    created.canEdit.should.equal( true );

  } );

} );
