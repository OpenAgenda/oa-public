import _ from 'lodash';
import VError from 'verror';
import Inboxes, { config, initAndLoad, seed, InboxUsers, InboxUser } from './service';
import testconfig from '../testconfig';

const database = testconfig.mysql.database + '_InboxUser';
const tables = [ 'inbox', 'inboxUser' ];

describe( 'InboxUser', () => {

  beforeAll( async () => {

    await initAndLoad( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    }, [] );

  } );

  beforeEach( async () => {

    await config.knex.transaction( async trx => {
      await trx.raw( `SET foreign_key_checks = 0` );
      for ( const table of tables ) {
        await trx( config.schemas[ table ] ).truncate();
      }
      await trx.raw( `SET foreign_key_checks = 1` );
    } );

    await seed( {
      ...testconfig,
      mysql: { ...testconfig.mysql, database }
    }, tables );

  } );

  afterAll( async () => {

    await config.knex.raw( `DROP DATABASE IF EXISTS ${database}` );
    await config.knex.destroy();

  } );

  describe( 'create', () => {

    test( 'create an inbox user', async () => {

      const inboxUser = await Inboxes( { type: 'agenda', identifier: 48959239 } ).users.add( { userUid: 12341234 } );

      expect( inboxUser.toJSON() ).toEqual({ id: 10, inboxId: 1, userUid: 12341234, leftAt: null });

    } );

    test( 'create an already existant inbox user', async () => {

      const inboxUser = await Inboxes( { type: 'agenda', identifier: 48959239 } ).users.add( { userUid: 23456789 } );

      expect( inboxUser.toJSON() ).toEqual({ id: 1, inboxId: 1, userUid: 23456789, leftAt: null });

    } );

    test( 'create an inbox user - inbox not found', async () => {

      try {

        await Inboxes( { type: 'agenda', identifier: 12345678 } ).users.add( { userUid: 99999999 } );

      } catch ( e ) {

        expect( e.message ).toBe('Inbox { type: \'agenda\', identifier: 12345678 } not found');

      }

    } );

    test( 're-add an inbox user that have been deleted', async () => {

      const inboxUser = await Inboxes( 4 ).users.add( { userUid: 89216486 } );

      expect( inboxUser.data.userUid ).toBe(89216486);
      expect( inboxUser.data.id ).toBe(4);

    } );

  } );

  describe( 'get', () => {

    describe( 'get passing by an inbox', () => {

      test( 'get an inbox user by identifiers', async () => {

        const inboxUser = await Inboxes( 1 ).users.get( { userUid: 23456789 } );

        expect( inboxUser.toJSON() ).toEqual({ id: 1, inboxId: 1, userUid: 23456789, leftAt: null });

      } );

      test( 'get an inbox user by id', async () => {

        const inboxUser = await Inboxes( 1 ).users.get( 1 );

        expect( inboxUser.toJSON() ).toEqual({ id: 1, inboxId: 1, userUid: 23456789, leftAt: null });

      } );

      test( 'get a detailed inbox user', async () => {

        const inboxUser = await Inboxes( 1 ).users.get( 1, { detailed: true } );

        expect( inboxUser.toJSON() ).toEqual({
          id: 1,
          inboxId: 1,
          userUid: 23456789,
          name: 'Jean-Roger Benbambou',
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          leftAt: null,
          uid: 23456789
        });

      } );

      test( 'get an inbox user that doesn\'t exist', async () => {

        const inboxUser = await Inboxes( 1 ).users.get( 42 );

        expect( inboxUser.toJSON() ).toBeNull();

      } );

    } );

    describe( 'get directly', () => {

      test( 'get an inbox user by id', async () => {

        const inboxUser = await new InboxUser( 1 ).get();

        expect( inboxUser.toJSON() ).toEqual({ id: 1, inboxId: 1, userUid: 23456789, leftAt: null });

      } );

      test( 'get an inbox user by identifiers', async () => {

        const inboxUser = await new InboxUser( { inboxId: 2, userUid: 99999999 } ).get();

        expect( inboxUser.toJSON() ).toEqual({ id: 2, inboxId: 2, userUid: 99999999, leftAt: null });

      } );

      test( 'get an inbox user by identifiers with missing inboxId', async () => {

        try {

          await new InboxUser( { userUid: 99999999 } ).get();

        } catch ( e ) {

          expect( VError.info( e ).errors.inboxId.code ).toBe('required');

        }

      } );

    } );

  } );

  describe( 'list', () => {

    test( 'list inbox users of an inbox', async () => {

      const inboxUsers = await Inboxes( 4 ).users.list();

      expect( inboxUsers.data ).toEqual([
        {
          id: 3,
          inboxId: 4,
          userUid: 56484348,
          leftAt: null
        },
        {
          id: 4,
          inboxId: 4,
          userUid: 89216486,
          leftAt: new Date( '2017-09-28T18:22:04.000Z' )
        }
      ]);

    } );

    test( 'list inbox users of an inbox (without lefted)', async () => {

      const inboxUsers = await Inboxes( 4 ).users.list( { leftAt: false } );

      expect( inboxUsers.toJSON() ).toEqual([
        {
          id: 3,
          inboxId: 4,
          userUid: 56484348,
          leftAt: null
        }
      ]);

    } );

    test( 'list inbox users of some inboxes', async () => {

      const inboxUsers = await new InboxUsers().list( {
        inboxId: [ 1, 2 ]
      } );

      expect( inboxUsers.toJSON() ).toEqual([
        { id: 1, inboxId: 1, userUid: 23456789, leftAt: null },
        { id: 2, inboxId: 2, userUid: 99999999, leftAt: null },
        { id: 8, inboxId: 1, userUid: 32132112, leftAt: null }
      ]);

    } );

    test( 'list inbox users attached to a user', async () => {

      const inboxUsers = await new InboxUsers().list( {
        userUid: 99999999
      } );

      expect( inboxUsers.toJSON() ).toEqual([
        { id: 2, inboxId: 2, userUid: 99999999, leftAt: null },
        { id: 5, inboxId: 5, userUid: 99999999, leftAt: null }
      ]);

    } );

    test( 'list inbox users with missing inboxId', async () => {

      try {

        await new InboxUsers().list();

      } catch ( e ) {

        expect( VError.info( e ).errors.inboxId.code ).toBe('required');

      }

    } );

  } );

  describe( 'remove', () => {

    test( 'remove an inbox user', async () => {

      const user = await new Inboxes( 4 ).users.remove( { userUid: 56484348 } );

      expect( user.toJSON().leftAt ).toBeInstanceOf(Date);

      expect(
        _.omit( user.toJSON(), 'leftAt' )
      ).toEqual({
        id: 3,
        inboxId: 4,
        userUid: 56484348
      });

    } );

  } );

} );
