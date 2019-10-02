"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const config = require( '../testconfig' );

const mysql = require( 'mysql' );

const _ = require( 'lodash' );

const should = require( 'should' );

const im = require( 'immutability-helper' );

describe( 'agendaEvents - functional (server): update', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  afterEach( () => {

    svc.init( config );

  } );

  describe('simple update', () => {
    let result;

    before(async () => {
      result = await svc( 62792452 ).update( 10974548, {
        featured: true,
        state: 2,
        aggregated: true
      } );
    });

    it('result provides success boolean', () => {
      result.success.should.equal(true);
    });

    it('result provides updated value', () => {
      result.updated.featured.should.equal(true);
      result.updated.state.should.equal(2);
    });

    it('result provides value prior to update in before key', () => {
      result.before.featured.should.equal(false);
      result.before.state.should.equal(1);
    });

    it('aggregated bool is not updatable', () => {
      result.updated.aggregated.should.equal(false);
    });
  });

  describe( 'handling protected values', () => {

    let protectedRef, unprotectedRef;

    const forcedDate = new Date( '2018-02-28T08:00:00.000Z' );

    before( async () => {

      await svc( 1 ).create( 11, { userUid: 1 } );

      await svc( 1 ).create( 12, { userUid: 2 } );

    } );

    before( async () => {

      await svc( 1 ).update( 11, {
        userUid: 3,
        createdAt: forcedDate
      } );

      await svc( 1 ).update( 12, {
        userUid: 3,
        createdAt: forcedDate
      }, { protected: false } );

      protectedRef = await svc( 1 ).get( 11 );

      unprotectedRef = await svc( 1 ).get( 12 );

    } );

    it( 'protected ref userUid is unchanged', async () => {

      protectedRef.userUid.should.equal( 1 );

    } );

    it( 'protected ref createdAt timestamp is unchanged', async () => {

      protectedRef.createdAt.should.not.eql( forcedDate );

    } );

    it( 'unprotected ref userUid is changed', async () => {

      unprotectedRef.userUid.should.equal( 3 );

    } );

    it( 'unprotected ref createdAt timestamp is changed', async () => {

      unprotectedRef.createdAt.should.eql( forcedDate );

    } );

  } );


  describe( 'other', () => {

    it( 'cleans state given as string', async () => {

      let result = await svc( 62792452 ).update( 10974548, { featured: true, state: '1' } );

      result.updated.state.should.equal( 1 );

    } );

    it( 'simple update to refused state', async () => {

      const result = await svc( 62792452 ).update( 10974548, {
        state: -1
      } );

      result.updated.state.should.equal( -1 );

    } );

    it( 'simple update to canEdit set to true', async () => {

      const result = await svc( 62792452 ).update( 10974548, {
        canEdit: true
      } );

      result.updated.canEdit.should.equal( true );

    } );

    it( 'update is part update', async () => {

      await svc( 62792452 ).update( 10974548, {
        canEdit: true
      } );

      const result = await svc( 62792452 ).update( 10974548, {
        state: -1
      } );

      result.updated.canEdit.should.equal( true );

    } );

    it('update on sourceAgendaUid field replaces previous list', async () => {
      const result = await svc(62792452).update(60059313, {
        sourceAgendaUid: [88]
      });

      result.updated.sourceAgendaUid.should.eql([88]);
    });

    it( 'update without state does not change current state', async () => {

      await svc( 62792452 ).update( 10974548, {
        state: -1
      } );

      const result = await svc( 62792452 ).update( 10974548, {} );

      result.updated.state.should.equal( -1 );

    } );


    it( 'context can be passed in options to be transfered to onUpdate interface', done => {

      svc.init( im( config, {
        interfaces: {
          onUpdate: {
            $set: ( before, after, context ) => {

              context.should.eql( {
                userUid: 111,
                agendaUid: null,
                aggregated: false,
                sourceAgenda: null,
                transferToLegacy: false,
                agenda: null,
                event: null,
                legacy: true,
                batched: false
              } );

              done();

            }
          }
        }
      } ) );

      svc( 62792452 ).update( 10974548, { featured: true }, {
        context: {
          userUid: 111,
          aggregated: false,
          sourceAgenda: null,
          transferToLegacy: false,
          agenda: null,
          event: null,
          legacy: true
        }
      } );

    } );

  } );

} );
