import _ from 'lodash';
import VError from 'verror';
import Inboxes, { config, initAndLoad, seed } from './service';
import testconfig from '../testconfig';

const database = testconfig.mysql.database + '_Message';
const tables = [ 'inbox', 'inboxUser', 'conversation', 'inboxConversation', 'message' ];

describe( 'Message', () => {

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

    test( 'create a message - by inboxes endpoint', async () => {

      const conversation = await Inboxes( 1 ).conversations.get( 1 );
      const message = await conversation.messages.create( {
        body: 'Salut toi, mets moi admin, et vite ! 🎉',
        userUid: 23456789
      } );

      expect( _.omit( message.toJSON(), 'createdAt', 'id' ) ).eql( {
        conversationId: 1,
        body: 'Salut toi, mets moi admin, et vite ! 🎉',
        attachments: [],
        inboxUser: {
          id: 1,
          inboxId: 1,
          userUid: 23456789,
          name: 'Jean-Roger Benbambou',
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          leftAt: null,
          uid: 23456789
        },
        inbox: {
          id: 1,
          type: 'agenda',
          identifier: 48959239,
          name: 'La gargouille',
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          uid: 48959239
        }
      } );

    } );

    test( 'create a message - by user endpoint', async () => {

      const conversation = await Inboxes.user( 99999999 ).conversations.get( 1 );
      const message = await conversation.messages.create( {
        body: 'Salut toi, mets moi admin, et vite !'
      } );

      expect( _.omit( message.toJSON(), 'createdAt', 'id' ) ).eql( {
        conversationId: 1,
        body: 'Salut toi, mets moi admin, et vite !',
        attachments: [],
        inboxUser: {
          id: 2,
          inboxId: 2,
          userUid: 99999999,
          name: 'Jean-Roger Benbambou',
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          leftAt: null,
          uid: 99999999
        },
        inbox: {
          id: 2,
          type: 'user',
          identifier: 99999999,
          name: 'L\'admin',
          avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
          uid: 99999999
        }
      } );

    } );

    test( 'create a message - by inboxes endpoint with missing userUid', async () => {

      const conversation = await Inboxes( 1 ).conversations.get( 1 );

      try {
        await conversation.messages.create( {
          body: 'Salut toi, mets moi admin, et vite !'
        } );
      } catch ( err ) {
        expect( VError.info( err ).errors.userUid.code ).equal( 'required' );
      }

    } );

    test( 'create a message - by inboxes endpoint with inexistant inboxUser', async () => {

      const conversation = await Inboxes( 1 ).conversations.get( 1 );

      try {
        await conversation.messages.create( {
          body: 'Salut toi, mets moi admin, et vite !',
          userUid: 23456790
        } );
      } catch ( err ) {
        expect( err.message ).equal( 'InboxUser { userUid: 23456790 } not found in Inbox { id: 1 }' );
      }

    } );

    test( 'create a message - createInboxUserOnNull option create the inexistant inboxUser', async () => {

      const conversation = await Inboxes( 1 ).conversations.get( 1 );

      const message = await conversation.messages.create( {
        body: 'Salut toi, mets moi admin, et vite !',
        userUid: 78945621
      }, { createInboxUserOnNull: true } );

      expect( _.omit( message.toJSON(), 'createdAt', 'id', 'inboxUser.id' ) ).eql( {
        conversationId: 1,
        body: 'Salut toi, mets moi admin, et vite !',
        attachments: [],
        inboxUser: {
          inboxId: 1,
          userUid: 78945621,
          leftAt: null,
          uid: 78945621,
          name: 'Jean-Roger Benbambou',
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png'
        },
        inbox: {
          id: 1,
          type: 'agenda',
          identifier: 48959239,
          uid: 48959239,
          name: 'La gargouille',
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg'
        }
      } );

    } );

  } );

  describe( 'get', () => {

    test( 'get a message by his id', async () => {

      const conversation = await Inboxes( 1 ).conversations.get( 1 );
      const message = await conversation.messages.get( 1 );

      expect( _.omit( message.toJSON(), 'createdAt' ) ).eql( {
        id: 1,
        conversationId: 1,
        body: 'Salut, ca marche pas ! comment qu\'on fé ?',
        attachments: [],
        inboxUser: {
          id: 1,
          inboxId: 1,
          userUid: 23456789,
          name: 'Jean-Roger Benbambou',
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          leftAt: null,
          uid: 23456789
        },
        inbox: {
          id: 1,
          type: 'agenda',
          identifier: 48959239,
          name: 'La gargouille',
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          uid: 48959239
        }
      } );

    } );

  } );

  describe( 'list', () => {

    test( 'list messages of a conversation - by inboxes endpoint', async () => {

      const conversation = await Inboxes( 1 ).conversations.get( 1 );
      const messages = await conversation.messages.list();

      const result = messages.toJSON().map( v => _.omit( v, 'createdAt' ) );

      expect( result ).eql( [
        {
          id: 2,
          conversationId: 1,
          body: 'Si tu ne sais pas tu ne fais pas, tampis pour toi ! 🙌',
          attachments: [],
          inbox: {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999
          }
        },
        {
          id: 1,
          conversationId: 1,
          body: 'Salut, ca marche pas ! comment qu\'on fé ?',
          attachments: [],
          inboxUser: {
            id: 1,
            inboxId: 1,
            userUid: 23456789,
            name: 'Jean-Roger Benbambou',
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            leftAt: null,
            uid: 23456789
          },
          inbox: {
            id: 1,
            type: 'agenda',
            identifier: 48959239,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            uid: 48959239
          }
        }
      ] );

    } );

    test( 'list messages of a conversation - by user endpoint', async () => {

      const conversation = await Inboxes.user( 99999999 ).conversations.get( 1 );
      const messages = await conversation.messages.list();

      const result = messages.toJSON().map( v => _.omit( v, 'createdAt' ) );

      expect( result ).eql( [
        {
          id: 2,
          conversationId: 1,
          body: 'Si tu ne sais pas tu ne fais pas, tampis pour toi ! 🙌',
          attachments: [],
          inboxUser: {
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            leftAt: null,
            uid: 99999999
          },
          inbox: {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999
          }
        },
        {
          id: 1,
          conversationId: 1,
          body: 'Salut, ca marche pas ! comment qu\'on fé ?',
          attachments: [],
          inbox: {
            id: 1,
            type: 'agenda',
            identifier: 48959239,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            uid: 48959239
          }
        }
      ] );

    } );

  } );

} );
