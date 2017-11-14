import _ from 'lodash';
import VError from 'verror';
import Inboxes, { config, initAndLoad, seed, InboxUser } from './service';
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

      expect( inboxUser.toJSON() ).eql( { id: 7, inboxId: 1, userUid: 12341234, leftAt: null } );

    } );

    test( 'create an already existant inbox user', async () => {

      const inboxUser = await Inboxes( { type: 'agenda', identifier: 48959239 } ).users.add( { userUid: 23456789 } );

      expect( inboxUser.toJSON() ).eql( { id: 1, inboxId: 1, userUid: 23456789, leftAt: null } );

    } );

    test( 'create an inbox user - inbox not found', async () => {

      try {

        await Inboxes( { type: 'agenda', identifier: 12345678 } ).users.add( { userUid: 99999999 } );

      } catch ( e ) {

        expect( e.message ).equal( 'Inbox { type: \'agenda\', identifier: 12345678 } not found' );

      }

    } );

  } );

  describe( 'get', () => {

    describe( 'get passing by an inbox', () => {

      test( 'get an inbox user by identifiers', async () => {

        const inboxUser = await Inboxes( 1 ).users.get( { userUid: 23456789 } );

        expect( inboxUser.toJSON() ).eql( { id: 1, inboxId: 1, userUid: 23456789, leftAt: null } );

      } );

      test( 'get an inbox user by id', async () => {

        const inboxUser = await Inboxes( 1 ).users.get( 1 );

        expect( inboxUser.toJSON() ).eql( { id: 1, inboxId: 1, userUid: 23456789, leftAt: null } );

      } );

      test( 'get an inbox user that doesn\'t exist', async () => {

        const inboxUser = await Inboxes( 1 ).users.get( 42 );

        expect( inboxUser.toJSON() ).equal( null );

      } );

    } );

    describe( 'get directly', () => {

      test( 'get an inbox user by id', async () => {

        const inboxUser = await new InboxUser( 1 ).get();

        expect( inboxUser.toJSON() ).eql( { id: 1, inboxId: 1, userUid: 23456789, leftAt: null } );

      } );

      test( 'get an inbox user by identifiers', async () => {

        const inboxUser = await new InboxUser( { inboxId: 2, userUid: 99999999 } ).get();

        expect( inboxUser.toJSON() ).eql( { id: 2, inboxId: 2, userUid: 99999999, leftAt: null } );

      } );

      test( 'get an inbox user by identifiers with missing inboxId', async () => {

        try {

          await new InboxUser( { userUid: 99999999 } ).get();

        } catch ( e ) {

          expect( VError.info( e ).errors.inboxId.code ).equal( 'required' );

        }

      } );

    } );

  } );

  describe( 'remove', () => {

    test( 'remove an inbox user', async () => {

      const user = await new Inboxes( 4 ).users.remove( { userUid: 56484348 } );

      expect( user.toJSON().leftAt ).instanceof( Date );

      expect(
        _.omit( user.toJSON(), 'leftAt' )
      ).eql( {
        id: 3,
        inboxId: 4,
        userUid: 56484348
      } );

    } );

  } );

} );
