"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const Service = require( './service' );
const config = require( '../testconfig' );

let service;

describe( 'activities - feed', () => {

  jest.setTimeout( 30000 );

  describe( 'without config', () => {

    it('use feed method throw an error', () => {

      return expect(Service( {} )).rejects.toThrow();

    });

  } );

  describe( 'with config', () => {

    beforeEach(async () => {

      service = await Service.initAndLoad({
        ...config,
        knex: knexLib({
          client: 'mysql',
          connection: config.mysql
        }),
      }, [ 'feed', 'feed_follow' ] );

    });

    // afterAll(() => service.shutdown());


    it('call feed method with bad entity type', () => {

      expect(() => {

        service.feed( { entityType: 'badybad', entityUid: 1 } ).create();

      }).toThrowError('You cannot use feed of type badybad');

    });


    it('call feed method that works', done => {

      expect(() => {

        service.feed( { entityType: 'user', entityUid: 1 } ).create()
          .then( () => done() )
          .catch( err => {

            console.log( err );

            return Promise.reject( err );

          } );

      }).not.toThrowError('You cannot use feed of type user');

    });

    describe( 'get', () => {

      it('get a feed', () => {

        return expect(service.feed({ entityType: 'user', entityUid: 42 }).get())
          .resolves.toMatchObject({ entityType: 'user', entityUid: 42 });

      });

      it('get a feed by his id', () => {

        return expect(service.feed( 2 ).get())
          .resolves.toMatchObject({ entityType: 'user', entityUid: 42 });

      });

      it('get a feed with his follow', () => {

        return expect(service.feed( 4 ).get( { followed: true } )).resolves.toMatchObject( {
            entityType: 'user',
            entityUid: 44,
            followed: [
              { id: 2, originFeed: 6, targetFeed: 4, store: {} }
            ]
          } );

      });

      it('get a feed with his followedBy', () => {

        return expect(service.feed( 4 ).get( { followedBy: true } )).resolves.toMatchObject( {
            entityType: 'user',
            entityUid: 44,
            followedBy: [
              { id: 3, originFeed: 4, targetFeed: 7, store: {} },
              { id: 4, originFeed: 4, targetFeed: 8, store: {} }
            ]
          } );

      });

      it('get a feed with his follow & followedBy', () => {

        return expect(service.feed( 4 ).get( { followed: true, followedBy: true } )).resolves.toMatchObject( {
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

      });

      it('get a feed by his id in an identifiers object', () => {

        return expect(service.feed( { id: 2 } ).get())
          .resolves.toMatchObject({ entityType: 'user', entityUid: 42 });

      });

      it('get an inexistent feed', () => {

        return expect(service.feed( { entityType: 'user', entityUid: 32 } ).get()).resolves.toBeNull();

      });

      it('get a feed with protected fields', () => {

        return expect(service.feed( 2 ).get( { internal: true } ))
          .resolves.toMatchObject({ id: 2, entityType: 'user', entityUid: 42 });

      });

    } );

    describe( 'create', () => {

      it('create a user feed', () => {

        return expect(service.feed( { entityType: 'user', entityUid: 2 } ).create())
          .resolves.toMatchObject({ entityType: 'user', entityUid: 2 });

      });

      it('create a user feed that already exists', () => {

        return expect(service.feed( { entityType: 'user', entityUid: 42 } ).create())
          .rejects.toThrow('Feed already exists');

      });

      it('create a user feed with not validated uid', async () => {

        const error = await service.feed( { entityType: 'user', entityUid: 'hmm' } ).create()
          .then(() => null, e => e);

        expect(error).toMatchObject([
          {
            field: 'entityUid',
            code: 'number.invalid',
            message: 'not a number',
            origin: 'hmm',
          },
        ]);

      });

    } );

    describe( 'follow', () => {

      it('follow feed', () => {

        return expect(service.feed( { id: 2 } ).follow( { id: 5 } )).resolves.toBe( 8 );

      });

      it('follow feed that already followed', () => {

        return expect(service.feed( 4 ).follow( 6 )).rejects.toThrow('Feed already followed');

      });

      it('follow feed that does not exists', () => {

        return expect(service.feed( { id: 2 } ).follow( { id: 75 } )).resolves.toBe( 0 );

      });

      it('follow feed with a store', () => {

        return expect(service.feed( { id: 2 } ).follow( { id: 6 }, { blabla: 'car' } )
          .then( () => service.feed( { id: 2 } ).get( { followed: true } ) )).resolves.toMatchObject( {
            entityType: 'user',
            entityUid: 42,
            followed: [
              { id: 8, originFeed: 6, targetFeed: 2, store: { blabla: 'car' } }
            ]
          } );

      });

    } );

    describe( 'unfollow', () => {

      it('unfollow feed', async () => {

        await service.feed( { id: 2 } ).follow( { id: 5 } );
        return expect(service.feed( { id: 2 } ).unfollow( { id: 5 } )).resolves.toBe( 1 );

      });

      it('unfollow feed that does not exists', () => {

        return expect(service.feed( { id: 2 } ).unfollow( { id: 75 } )).resolves.toBe( 0 );

      });

    } );

    describe( 'remove', () => {

      it('remove a user feed', () => {

        return expect(service.feed( { entityType: 'user', entityUid: 42 } ).remove()).resolves.toBe( 1 );

      });

      it('remove a user feed by his id', () => {

        return expect(service.feed( { id: 4 } ).remove()).resolves.toBe( 1 );

      });

      it('remove a user feed that not exist', () => {

        return expect(service.feed( { entityType: 'user', entityUid: 32 } ).remove()).resolves.toBe( 0 );

      });

    } );

  } );

} );
