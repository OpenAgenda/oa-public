"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const remove = require( '../service/remove' );

const config = require( '../testconfig' );

const should = require( 'should' );

const im = require( 'immutability-helper' );

const queue = require( '@openagenda/queue' );

describe( 'agendaEvents - functional (server): remove', function() {

  this.timeout( 5000 );

  beforeEach( done => {

    svc.initAndLoad( config, done );

  } );
 
  beforeEach( done => {

    queue( 'agendaEventInterfaces', { redis: config.redis } ).test.clear( done );

  } );

  it( 'simple remove', async () => {

    let before = await svc( 62792452 ).get( 10974548 );

    let result = await svc( 62792452 ).remove( 10974548 );

    let after = await svc( 62792452 ).get( 10974548 );

    result.success.should.equal( true );

    before.should.not.equal( null );

    should( after ).equal( null );

  } );


  it( 'remove by legacyId', async () => {

    let before = await svc( 62792452 ).get( 10974548 );

    let result = await remove.byLegacyId( 42, 24 );

    let after = await svc( 62792452 ).get( 10974548 );

    result.success.should.equal( true );

    before.should.not.equal( null );

    should( after ).equal( null );    

  } );


  it( 'remove by legacyId with eventId only', async () => {

    let before = await svc( 62792452 ).get( 10974548 );

    let result = await remove.byLegacyId( null, 24 );

    let after = await svc( 62792452 ).get( 10974548 );

    result.success.should.equal( true );

    before.should.not.equal( null );

    should( after ).equal( null ); 

  } );


  it( 'all references of given event can be removed in one call', async () => {

    let result = await svc.remove( 15205357 );

    result.should.eql( {
      success: true,
      removed: 2
    } );

  } );


  it( 'when several references are removed', done => {

    let count = 0;

    svc.init( im( config, {
      interfaces: {
        onRemove: {
          $set: ( removed, context ) => {

            count++;

            removed.eventUid.should.equal( 15205357 );

            if ( count === 2 ) {

              done();

            }

          }
        }
      }
    } ) );

    svc.remove( 15205357 );

    svc.tasks.interfaces();

  } );


  it( 'context can be passed in options to be transfered to onRemove interface', done => {

    svc.init( im( config, {
      interfaces: {
        onRemove: {
          $set: ( removed, context ) => {

            context.should.eql( {
              userUid: 111,
              agendaUid: null,
              transferToLegacy: false
            } );

            done();

          }
        }
      }
    } ) );

    svc( 62792452 ).remove( 10974548, {
      context: {
        userUid: 111
      }
    } );

  } );

} );