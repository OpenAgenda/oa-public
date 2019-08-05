"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );
const queues = require( './mock/queues' );

describe( 'members - functional - setByEmail', () => {

  const f = fixtures( config.mysql );

  let svc;

  before( async () => {

    await f.load();

    svc = Service( {
      knex: f.client,
      interfaces: {
        getUsersByUid: require( './fixtures/getUsersByUid' ),
        getEventCountByUserUid: require( './fixtures/getEventCountByUserUid' ),
        onRemove: member => onRemoveArgument = member
      },
      queues,
      bulkThreshold: 1
    } );

  } );

  after( f.destroyClient );

  describe( 'setByEmail', () => {

    describe( 'set creates', () => {

      let result, member;

      before( async () => {

        member = await svc.get.byEmail( {
          email: 'kevin@oa.com',
          agendaUid: 1
        } );

      } );

      before( async () => {
        result = await svc.set.byEmail( {
          agendaUid: 1,
          email: 'kevin@oa.com',
          role: 2
        }, { requireCustom: false } );
      } );

      it( 'member was not existing before set', async () => {
        should( member ).equal( null );
      } );

      it( 'created member is not associated to any user', async () => {
        should( result.member.userUid ).equal( null );
      } );

    } );

    describe( 'set promotes', () => {

      let result, member;

      before( async () => {
        member = await svc.get.byEmail( {
          agendaUid: 1,
          email: 'jc@ponceau.fr'
        } );
      } );

      before( async () => {
        result = await svc.set.byEmail( {
          agendaUid: 1,
          email: 'jc@ponceau.fr',
          role: 2
        }, { requireCustom: false } );
      } );

      it( 'member was not admin before set', async () => {
        member.role.should.equal( 1 );
      } );

      it( 'member is admin after set', async () => {
        result.member.role.should.equal( 2 );
      } );

    } );

    describe( 'bulk', () => {

      const queueCalls = [];
      let result;

      before( async () => {

        queues.mockOn( 'register', methods => {
          queueCalls.push( { call: 'register', methods } );
        } );

        queues.mockOn( 'queue', ( ...args ) => {
          queueCalls.push( { call: 'queue', args } );
        } );

        svc.task();

        result = await svc.set.byEmail.bulk( {
          agendaUid: 123,
          role: 1
        }, [ 'albert@oa.com', 'alice@oa.com' ], {
          requireCustom: false
        } );

      } );

      it( 'service task registers setByEmail method', () => {
        queueCalls[ 0 ].call.should.equal( 'register' );
        Object.keys( queueCalls[ 0 ].methods )[ 0 ].should.equal( 'setByEmail' );
      } );

      it( 'if bulk items are above threshold, they are queued', () => {
        queueCalls.filter( c => c.call === 'queue' ).length.should.equal( 2 );
      } );

      it( 'result provides queued count', () => {
        result.queued.should.equal( 2 );
      } );

      it( 'queued arguments are prepared to be given as is to set method', () => {
        queueCalls.filter( c => c.call === 'queue' )[ 0 ].should.eql( {
          call: 'queue',
          args: [
            'setByEmail',
            { agendaUid: 123, role: 1, email: 'albert@oa.com' },
            { requireCustom: false }
          ] } )
      } );

      it( 'if bulk items are below threshold, they are processed directly', async () => {

        const result = await svc.set.byEmail.bulk( {
          agendaUid: 123,
          role: 1
        }, [ 'bernard@oa.com' ], {
          requireCustom: false
        } );

        result.queued.should.equal( 0 );

        result.processed.length.should.equal( 1 );

        Object.keys( result.processed[ 0 ] ).should.eql( [
          'errors', 'success', 'member', 'operation'
        ] );

      } );

    } );

  } );

} );
