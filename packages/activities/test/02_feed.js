"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const Service = require( './service' );
const config = require( '../testconfig' );

let service;

describe( 'activities - feed', function () {

  this.timeout( 30000 );

  describe( 'without config', () => {

    it( 'use feed method throw an error', () => {

      return Service( {} ).should.rejectedWith( 'Unable to acquire a connection' );

    } );

  } );

  describe( 'with config', () => {

    before( async () => {

      service = await Service.initAndLoad( config, [ 'feed', 'feed_follow' ] );

    } );

    after( () => service.shutdown() );


    it( 'call feed method with bad entity type', () => {

      (() => {

        service.feed( { entityType: 'badybad', entityUid: 1 } ).create();

      }).should.throw( 'You cannot use feed of type badybad' );

    } );


    it( 'call feed method that works', done => {

      (() => {

        service.feed( { entityType: 'user', entityUid: 1 } ).create()
          .then( () => done() )
          .catch( err => {

            console.log( err );

            return Promise.reject( err );

          } );

      }).should.not.throw( 'You cannot use feed of type user' );

    } );

    describe( 'get', () => {

      it( 'get a feed', () => {

        return service.feed( { entityType: 'user', entityUid: 42 } ).get()
          .should.fulfilled()
          .then( result => result.should.match( { entityType: 'user', entityUid: 42 } ) );

      } );

      it( 'get a feed by his id', () => {

        return service.feed( 2 ).get()
          .should.fulfilled()
          .then( result => result.should.match( { entityType: 'user', entityUid: 42 } ) );

      } );

      it( 'get a feed with his follow', () => {

        return service.feed( 4 ).get( { followed: true } )
          .should.fulfilledWith( {
            entityType: 'user',
            entityUid: 44,
            followed: [
              { id: 2, originFeed: 6, targetFeed: 4, store: {} }
            ]
          } );

      } );

      it( 'get a feed with his followedBy', () => {

        return service.feed( 4 ).get( { followedBy: true } )
          .should.fulfilledWith( {
            entityType: 'user',
            entityUid: 44,
            followedBy: [
              { id: 3, originFeed: 4, targetFeed: 7, store: {} },
              { id: 4, originFeed: 4, targetFeed: 8, store: {} }
            ]
          } );

      } );

      it( 'get a feed with his follow & followedBy', () => {

        return service.feed( 4 ).get( { followed: true, followedBy: true } )
          .should.fulfilledWith( {
            entityType: 'user',
            entityUid: 44,
            followed: [
              { id: 2, originFeed: 6, targetFeed: 4, store: {} }
            ],
            followedBy: [
              { id: 3, originFeed: 4, targetFeed: 7, store: {} },
              { id: 4, originFeed: 4, targetFeed: 8, store: {} }
            ]
          } );

      } );

      it( 'get a feed by his id in an identifiers object', () => {

        return service.feed( { id: 2 } ).get()
          .should.fulfilled()
          .then( result => result.should.match( { entityType: 'user', entityUid: 42 } ) );

      } );

      it( 'get an inexistent feed', () => {

        return service.feed( { entityType: 'user', entityUid: 32 } ).get()

          .should.fulfilledWith( null );

      } );

      it( 'get a feed with protected fields', () => {

        return service.feed( 2 ).get( { internal: true } )
          .should.fulfilled()
          .then( result => result.should.match( { id: 2, entityType: 'user', entityUid: 42 } ) );

      } );

    } );

    describe( 'create', () => {

      it( 'create a user feed', () => {

        return service.feed( { entityType: 'user', entityUid: 2 } ).create()
          .should.fulfilled()
          .then( result => result.should.match( { entityType: 'user', entityUid: 2 } ) );

      } );

      it( 'create a user feed that already exists', () => {

        return service.feed( { entityType: 'user', entityUid: 42 } ).create()
          .should.rejectedWith( Error, { message: 'Feed already exists' } );

      } );

      it( 'create a user feed with not validated uid', () => {

        return service.feed( { entityType: 'user', entityUid: 'hmm' } ).create()
          .should.rejectedWith( Array, [ {
            field: 'entityUid',
            code: 'number.invalid',
            message: 'not a number',
            origin: 'hmm'
          } ] );

      } );

    } );

    describe( 'follow', () => {

      it( 'follow feed', () => {

        return service.feed( { id: 2 } ).follow( { id: 5 } )
          .should.fulfilledWith( 8 );

      } );

      it( 'follow feed that already followed', () => {

        return service.feed( 4 ).follow( 6 )
          .should.rejectedWith( Error, { message: 'Feed already followed' } );

      } );

      it( 'follow feed that does not exists', () => {

        return service.feed( { id: 2 } ).follow( { id: 75 } )
          .should.fulfilledWith( 0 );

      } );

      it( 'follow feed with a store', () => {

        return service.feed( { id: 2 } ).follow( { id: 6 }, { blabla: 'car' } )
          .then( () => service.feed( { id: 2 } ).get( { followed: true } ) )
          .should.fulfilledWith( {
            entityType: 'user',
            entityUid: 42,
            followed: [
              { id: 8, originFeed: 5, targetFeed: 2, store: {} },
              { id: 9, originFeed: 6, targetFeed: 2, store: { blabla: 'car' } }
            ]
          } );

      } );

    } );

    describe( 'unfollow', () => {

      it( 'unfollow feed', () => {

        return service.feed( { id: 2 } ).unfollow( { id: 5 } )
          .should.fulfilledWith( 1 );

      } );

      it( 'unfollow feed that does not exists', () => {

        return service.feed( { id: 2 } ).unfollow( { id: 75 } )
          .should.fulfilledWith( 0 );

      } );

    } );

    describe( 'remove', () => {

      it( 'remove a user feed', () => {

        return service.feed( { entityType: 'user', entityUid: 42 } ).remove()
          .should.fulfilledWith( 1 );

      } );

      it( 'remove a user feed by his id', () => {

        return service.feed( { id: 4 } ).remove()
          .should.fulfilledWith( 1 );

      } );

      it( 'remove a user feed that not exist', () => {

        return service.feed( { entityType: 'user', entityUid: 32 } ).remove()
          .should.fulfilledWith( 0 );

      } );

    } );

  } );

} );
