import VError from 'verror';
import Inboxes, { config, initAndLoad, seed, InboxUsers, Conversations } from './service';
import testconfig from '../testconfig';

const database = testconfig.mysql.database + '_Inbox';
const tables = [ 'inbox' ];

describe( 'Inbox', () => {

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

  describe( 'instanciate', () => {

    test( 'instanciate Inbox with constructor', () => {

      const inbox = new Inboxes( 42 );

      expect( inbox ).toBeInstanceOf(Inboxes);

    } );

    test( 'instanciate Inbox with a function call', () => {

      const inbox = Inboxes( 42 );

      expect( inbox ).toBeInstanceOf(Inboxes);

    } );

    test( 'instanciate Inbox with bad id type throw a validation error', () => {

      try {
        Inboxes( 'bad' );
      } catch ( err ) {
        expect( VError.info( err ).errors.id.code ).toBe('type.integer');
        expect( err.name ).toBe('ValidationError');
      }

    } );

    test( 'instanciate Inbox with bad identifiers format throw a validation error', () => {

      try {
        Inboxes( { type: 45, identifier: 'fezsf' } );
      } catch ( err ) {
        expect( VError.info( err ).errors.type.code ).toBe('type.string');
        expect( VError.info( err ).errors.identifier.code ).toBe('type.integer');
        expect( err.name ).toBe('ValidationError');
      }

    } );

  } );

  describe( 'create', () => {

    test( 'create an inbox', async () => {

      const inbox = await Inboxes().create( { type: 'agenda', identifier: 1245685 } );

      expect( inbox.toJSON() ).toEqual({ id: 9, type: 'agenda', identifier: 1245685 });

    } );

    test( 'create an inbox that already exist', async () => {

      const inbox = await Inboxes().create( { type: 'user', identifier: 45645678 } );

      expect( inbox.toJSON() ).toEqual({ id: 3, type: 'user', identifier: 45645678 });

    } );

    test( 'create an inbox with invalid type', async () => {

      try {
        await Inboxes().create( { type: 58, identifier: 99999999 } );
      } catch ( err ) {
        expect( VError.info( err ).errors.type.code ).toBe('type.string');
        expect( err.name ).toBe('ValidationError');
      }

    } );

    test( 'create an inbox with missing identifier', async () => {

      try {
        await Inboxes().create( { type: 'agenda' } );
      } catch ( err ) {
        expect( VError.info( err ).errors.identifier.code ).toBe('required');
        expect( err.name ).toBe('ValidationError');
      }

    } );

  } );

  describe( 'remove', () => {

    test( 'remove an inbox', async () => {

      const inbox = await Inboxes( { type: 'agenda', identifier: 48959239 } ).remove();

      expect( inbox.data ).toBe(null);

    } );

  } );

  describe( 'get', () => {

    test( 'get an inbox by identifiers', async () => {

      const inbox = await Inboxes( { type: 'agenda', identifier: 48959239 } ).get();

      expect( inbox.toJSON() ).toEqual({ id: 1, type: 'agenda', identifier: 48959239 });

    } );

    test( 'get an inbox by id', async () => {

      const inbox = await Inboxes( 1 ).get();

      expect( inbox.toJSON() ).toEqual({ id: 1, type: 'agenda', identifier: 48959239 });

    } );

    test( 'get an inbox that doesn\'t exist', async () => {

      const inbox = await Inboxes( 42 ).get();

      expect( inbox.toJSON() ).toBe(null);

    } );

    test( 'get an inbox that doesn\'t exist but can be created', async () => {

      const inbox = await Inboxes( { type: 'user', identifier: 678910 } ).get();

      expect( inbox.toJSON() ).toEqual({ id: 9, type: 'user', identifier: 678910 });

    } );

  } );

  describe( 'toJSON', () => {

    test( 'toJSON return data', async () => {

      const inbox = await Inboxes( 1 ).get();

      expect( inbox.toJSON() ).toEqual({ id: 1, type: 'agenda', identifier: 48959239 });

    } );

    test( 'toJSON return null when the Inbox is not getted', () => {

      expect( Inboxes( 1 ).toJSON() ).toBe(null);

    } );

  } );

  describe( 'link users', () => {

    test( '.users is an instance of InboxUsers', () => {

      const inbox = Inboxes( 1 ).users;

      expect( inbox ).toBeInstanceOf(InboxUsers);

    } );

  } );

  describe( 'link conversations', () => {

    test( '.conversations is an instance of Conversations', () => {

      const inbox = Inboxes( 1 ).conversations;

      expect( inbox ).toBeInstanceOf(Conversations);

    } );

  } );

} );
