import sinon from 'sinon';
import _ from 'lodash';
import VError from 'verror';
import Inboxes, { config, initAndLoad, seed, init } from './service';
import testconfig from '../testconfig';

const database = testconfig.mysql.database + '_Conversation';
const tables = [ 'inbox', 'inboxUser', 'conversation', 'inboxConversation', 'message' ];

describe( 'Conversation', () => {

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

    test( 'create a conversation with a message - by inboxes endpoint', async () => {

      const conversation = await Inboxes( 1 ).conversations.create( {
        destinationInbox: { type: 'user', identifier: 99999999 },
        type: 'event',
        typeIdentifier: 456789,
        params: { trucUtile: false },
        creatorInboxUser: { userUid: 23456789 },
        message: 'Comment qu\'on contribute ?'
      } );

      expect( _.omit(
        conversation.toJSON(),
        'createdAt', 'updatedAt', 'resolvedAt', 'latestMessage.createdAt'
      ) ).eql( {
        id: 6,
        type: 'event',
        typeIdentifier: 456789,
        creatorInbox: {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239
        },
        creatorInboxUser: {
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 1,
          inboxId: 1,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          userUid: 23456789,
          uid: 23456789,
        },
        store: { params: { trucUtile: false } },
        inboxContextId: 1,
        inboxes: [ {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239
        }, {
          avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
          id: 2,
          identifier: 99999999,
          name: 'L\'admin',
          type: 'user',
          uid: 99999999
        } ],
        latestMessage: {
          body: 'Comment qu\'on contribute ?',
          conversationId: 6,
          id: 11,
          inbox: {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 1,
            identifier: 48959239,
            name: 'La gargouille',
            type: 'agenda',
            uid: 48959239
          },
          inboxUser: {
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 1,
            inboxId: 1,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            userUid: 23456789,
            uid: 23456789,
          }
        },
        actions: [ {
          code: 'defaultAction',
          label: {
            fr: 'Fermer',
            en: 'Close'
          },
          kind: 'success'
        } ],
        closedAt: null
      } );

    } );

    test( 'create a conversation - by user endpoint', async () => {

      const conversation = await Inboxes.user( 99999999 ).conversations.create( {
        destinationInbox: { type: 'agenda', identifier: 48959239 },
        type: 'edition_request',
        params: {}
      } );

      expect( _.omit( conversation.toJSON(), 'createdAt', 'updatedAt', 'resolvedAt' ) ).eql( {
        id: 6,
        type: 'edition_request',
        typeIdentifier: null,
        creatorInbox: {
          avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
          id: 2,
          identifier: 99999999,
          name: 'L\'admin',
          type: 'user',
          uid: 99999999
        },
        creatorInboxUser: {
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 2,
          inboxId: 2,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          userUid: 99999999,
          uid: 99999999,
        },
        store: { params: {} },
        inboxContextId: 2,
        inboxUser: {
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 2,
          inboxId: 2,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          userUid: 99999999,
          uid: 99999999,
        },
        inboxes: [ {
          avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
          id: 2,
          identifier: 99999999,
          name: 'L\'admin',
          type: 'user',
          uid: 99999999
        }, {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239
        } ],
        latestMessage: null,
        actions: [ {
          code: 'defaultAction',
          label: {
            fr: 'Fermer',
            en: 'Close'
          },
          kind: 'success'
        } ],
        closedAt: null
      } );

    } );

    test( 'create a conversation with an inexistant destinationInbox create the destinationInbox', async () => {

      const conversation = await Inboxes.user( 99999999 ).conversations.create( {
        destinationInbox: { type: 'agenda', identifier: 456 },
        type: 'edition_request',
        params: {}
      } );

      expect( _.omit( conversation.toJSON(), 'createdAt', 'updatedAt', 'resolvedAt' ) ).eql( {
        id: 6,
        type: 'edition_request',
        typeIdentifier: null,
        creatorInbox: {
          avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
          id: 2,
          identifier: 99999999,
          name: 'L\'admin',
          type: 'user',
          uid: 99999999
        },
        creatorInboxUser: {
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 2,
          inboxId: 2,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          userUid: 99999999,
          uid: 99999999,
        },
        store: { params: {} },
        inboxContextId: 2,
        inboxUser: {
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 2,
          inboxId: 2,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          userUid: 99999999,
          uid: 99999999,
        },
        inboxes: [ {
          avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
          id: 2,
          identifier: 99999999,
          name: 'L\'admin',
          type: 'user',
          uid: 99999999
        }, {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 7,
          identifier: 456,
          name: 'La gargouille',
          type: 'agenda',
          uid: 456
        } ],
        latestMessage: null,
        actions: [ {
          code: 'defaultAction',
          label: {
            fr: 'Fermer',
            en: 'Close'
          },
          kind: 'success'
        } ],
        closedAt: null
      } );

    } );

    test(
      'create a conversation with an inexistant inboxUser and createInboxUserOnNull create the inboxUser',
      async () => {

        const conversation = await Inboxes( 1 ).conversations.create( {
          destinationInbox: { type: 'user', identifier: 99999999 },
          type: 'event',
          typeIdentifier: 456789,
          creatorInboxUser: { userUid: 85878525 }
        }, {
          createInboxUserOnNull: true
        } );

        expect( _.omit( conversation.toJSON(), 'createdAt', 'updatedAt', 'resolvedAt' ) ).eql( {
          id: 6,
          type: 'event',
          typeIdentifier: 456789,
          creatorInbox: {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 1,
            identifier: 48959239,
            name: 'La gargouille',
            type: 'agenda',
            uid: 48959239
          },
          creatorInboxUser: {
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 7,
            inboxId: 1,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            userUid: 85878525,
            uid: 85878525,
          },
          store: { params: {} },
          inboxContextId: 1,
          inboxes: [ {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 1,
            identifier: 48959239,
            name: 'La gargouille',
            type: 'agenda',
            uid: 48959239
          }, {
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 2,
            identifier: 99999999,
            name: 'L\'admin',
            type: 'user',
            uid: 99999999
          } ],
          latestMessage: null,
          actions: [ {
            code: 'defaultAction',
            label: {
              fr: 'Fermer',
              en: 'Close'
            },
            kind: 'success'
          } ],
          closedAt: null
        } );

      }
    );

  } );

  describe( 'get', () => {

    test( 'get a conversation - by inboxes endpoint', async () => {

      const conversation = await Inboxes( 4 ).conversations.get( 3 );

      expect(
        _.omit( conversation.toJSON(), 'createdAt', 'updatedAt', 'resolvedAt', 'latestMessage.createdAt' )
      ).eql( {
        id: 3,
        type: 'contact_form',
        typeIdentifier: null,
        store: { params: {} },
        inboxContextId: 4,
        creatorInbox: {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 5,
          identifier: 24681012,
          name: 'La gargouille',
          type: 'agenda',
          uid: 24681012
        },
        inboxes: [
          {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 4,
            identifier: 7891011,
            name: 'La gargouille',
            type: 'agenda',
            uid: 7891011,
          },
          {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 5,
            identifier: 24681012,
            name: 'La gargouille',
            type: 'agenda',
            uid: 24681012,
          }
        ],
        latestMessage: {
          body: 'Tu pourrais me demander si je vais bien aussi, tss !',
          conversationId: 3,
          id: 8,
          inbox: {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 5,
            identifier: 24681012,
            name: 'La gargouille',
            type: 'agenda',
            uid: 24681012,
          }
        },
        actions: [ {
          code: 'defaultAction',
          label: {
            fr: 'Fermer',
            en: 'Close'
          },
          kind: 'success'
        } ],
        closedAt: null
      } );

    } );

    test( 'get a conversation - by user endpoint', async () => {

      const conversation = await Inboxes.user( 99999999 ).conversations.get( 1 );

      expect(
        _.omit( conversation.toJSON(), 'createdAt', 'updatedAt', 'resolvedAt', 'latestMessage.createdAt' )
      ).eql( {
        id: 1,
        type: 'contribution_request',
        typeIdentifier: null,
        creatorInbox: {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239
        },
        store: { params: {} },
        inboxContextId: 2,
        inboxUser: {
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 2,
          inboxId: 2,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          uid: 99999999,
          userUid: 99999999
        },
        inboxes: [ {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239,
        }, {
          avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
          id: 2,
          identifier: 99999999,
          name: 'L\'admin',
          type: 'user',
          uid: 99999999,
        } ],
        latestMessage: {
          id: 2,
          body: 'Si tu ne sais pas tu ne fais pas, tampis pour toi ! 🙌',
          conversationId: 1,
          inboxUser: {
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            leftAt: null,
            uid: 99999999,
          },
          inbox: {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999,
          }
        },
        actions: [ {
          code: 'accept',
          label: {
            fr: 'Accepter',
            en: 'Accept'
          },
          kind: 'success'
        }, {
          code: 'refuse',
          label: {
            fr: 'Refuser',
            en: 'Refuse'
          },
          kind: 'danger'
        } ],
        closedAt: null
      } );

    } );

    test( 'get a conversation that isn\'t in the inbox', async () => {

      const conversation = await Inboxes( { type: 'user', identifier: 45645678 } ).conversations.get( 1 );

      expect( conversation.toJSON() ).equal( null );

    } );

  } );

  describe( 'update', () => {

    const now = new Date();

    beforeEach( () => {
      global.clock = sinon.useFakeTimers( { now: (now - now % 1000) } );

    } );

    afterEach( () => {

      global.clock.restore();

    } );

    test( 'update a conversation', async () => {

      const conversation = await Inboxes.user( 99999999 ).conversations.get( 1 );

      await conversation.update( {
        params: { un: { nouveau: 'truc' } },
        closedAt: new Date()
      } );

      expect(
        _.omit( conversation.toJSON(), 'createdAt', 'latestMessage.createdAt' )
      ).eql( {
        id: 1,
        type: 'contribution_request',
        typeIdentifier: null,
        creatorInbox: {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239
        },
        store: { params: { un: { nouveau: 'truc' } } },
        updatedAt: new Date(),
        resolvedAt: null,
        closedAt: new Date(),
        inboxContextId: 2,
        inboxUser: {
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 2,
          inboxId: 2,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          uid: 99999999,
          userUid: 99999999
        },
        inboxes: [ {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239
        }, {
          avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
          id: 2,
          identifier: 99999999,
          name: 'L\'admin',
          type: 'user',
          uid: 99999999
        } ],
        latestMessage: {
          id: 2,
          body: 'Si tu ne sais pas tu ne fais pas, tampis pour toi ! 🙌',
          conversationId: 1,
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
        actions: [ {
          code: 'accept',
          label: {
            fr: 'Accepter',
            en: 'Accept'
          },
          kind: 'success'
        }, {
          code: 'refuse',
          label: {
            fr: 'Refuser',
            en: 'Refuse'
          },
          kind: 'danger'
        } ]
      } );

    } );

    it( 'update params', async () => {

      const conversation = await Inboxes( 4 )
        .conversations.update( 3, { params: { un: { nouveau: 'truc' } } }, { userUid: 89216486 } );

      expect( conversation.data.store ).eql( { params: { un: { nouveau: 'truc' } } } );

    } );

  } );

  describe( 'list', () => {

    test( 'list conversations of an inbox', async () => {

      const conversations = await Inboxes( { type: 'agenda', identifier: 48959239 } ).conversations.list();

      const result = conversations.toJSON()
        .map( v => _.omit( v, 'createdAt', 'updatedAt', 'resolvedAt', 'closedAt', 'latestMessage.createdAt' ) );

      expect( result ).eql( [ {
        id: 1,
        type: 'contribution_request',
        typeIdentifier: null,
        store: { params: {} },
        creatorInbox: {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239
        },
        creatorInboxUser: {
          avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 1,
          inboxId: 1,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          userUid: 23456789,
          uid: 23456789,
        },
        inboxContextId: 1,
        inboxes: [ {
          id: 1,
          type: 'agenda',
          identifier: 48959239,
          name: 'La gargouille',
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          uid: 48959239
        }, {
          id: 2,
          type: 'user',
          identifier: 99999999,
          name: 'L\'admin',
          avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
          uid: 99999999
        } ],
        latestMessage: {
          id: 2,
          body: 'Si tu ne sais pas tu ne fais pas, tampis pour toi ! 🙌',
          conversationId: 1,
          inbox: {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999
          }
        }
      } ] );

    } );

    test( 'list conversations of a user', async () => {

      const conversations = await Inboxes.user( 99999999 ).conversations.list();

      const result = conversations.toJSON()
        .map( v => _.omit( v, 'createdAt', 'updatedAt', 'resolvedAt', 'closedAt', 'latestMessage.createdAt' ) );

      expect( result ).eql( [
        {
          id: 5,
          type: 'contact_form',
          typeIdentifier: null,
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 4,
            identifier: 7891011,
            name: 'La gargouille',
            type: 'agenda',
            uid: 7891011
          },
          inboxUser: {
            id: 2,
            inboxId: 2,
            leftAt: null,
            userUid: 99999999,
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            name: 'Jean-Roger Benbambou',
            uid: 99999999
          },
          inboxes: [ {
            id: 6,
            type: 'user',
            identifier: 86286559,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 86286559
          }, {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999
          } ],
          latestMessage: {
            id: 10,
            body: 'Salut, j\'avais juste envie de vous dire que je vais supprimer mon compte !',
            conversationId: 5,
            inbox: {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: 'L\'admin',
              avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559
            }
          }
        },
        {
          id: 4,
          type: 'contact_form',
          typeIdentifier: 456789,
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 6,
            identifier: 86286559,
            name: 'L\'admin',
            type: 'user',
            uid: 86286559
          },
          inboxUser: {
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            leftAt: null,
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            name: 'Jean-Roger Benbambou',
            uid: 99999999
          },
          inboxes: [ {
            id: 6,
            type: 'user',
            identifier: 86286559,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 86286559
          }, {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999
          } ],
          latestMessage: {
            id: 9,
            body: 'J\'en ai marre de vos gueules, j\'me tire d\'ici !',
            conversationId: 4,
            inbox: {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: 'L\'admin',
              avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559
            }
          }
        },
        {
          id: 3,
          type: 'contact_form',
          typeIdentifier: null,
          store: { params: {} },
          inboxContextId: 5,
          creatorInbox: {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 5,
            identifier: 24681012,
            name: 'La gargouille',
            type: 'agenda',
            uid: 24681012
          },
          creatorInboxUser: {
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 5,
            inboxId: 5,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            userUid: 99999999
          },
          inboxUser: {
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 5,
            inboxId: 5,
            userUid: 99999999,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999
          },
          inboxes: [ {
            id: 4,
            type: 'agenda',
            identifier: 7891011,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            uid: 7891011
          }, {
            id: 5,
            type: 'agenda',
            identifier: 24681012,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            uid: 24681012
          } ],
          latestMessage: {
            id: 8,
            body: 'Tu pourrais me demander si je vais bien aussi, tss !',
            conversationId: 3,
            inbox: {
              id: 5,
              type: 'agenda',
              identifier: 24681012,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 24681012
            },
            inboxUser: {
              avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
              id: 5,
              inboxId: 5,
              leftAt: null,
              name: 'Jean-Roger Benbambou',
              uid: 99999999,
              userUid: 99999999,
            }
          }
        },
        {
          id: 2,
          type: 'edition_request',
          typeIdentifier: null,
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 2,
            identifier: 99999999,
            name: 'L\'admin',
            type: 'user',
            uid: 99999999
          },
          creatorInboxUser: {
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 2,
            inboxId: 2,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            userUid: 99999999
          },
          inboxUser: {
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            leftAt: null
          },
          inboxes: [ {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999
          }, {
            id: 4,
            type: 'agenda',
            identifier: 7891011,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            uid: 7891011
          } ],
          latestMessage: {
            id: 5,
            body: 'Mais voyons Francis, sois poli stp !',
            conversationId: 2,
            inbox: {
              id: 4,
              type: 'agenda',
              identifier: 7891011,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 7891011
            }
          }
        },
        {
          id: 1,
          type: 'contribution_request',
          typeIdentifier: null,
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 1,
            identifier: 48959239,
            name: 'La gargouille',
            type: 'agenda',
            uid: 48959239
          },
          inboxUser: {
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            leftAt: null
          },
          inboxes: [ {
            id: 1,
            type: 'agenda',
            identifier: 48959239,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            uid: 48959239
          }, {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999
          } ],
          latestMessage: {
            id: 2,
            body: 'Si tu ne sais pas tu ne fais pas, tampis pour toi ! 🙌',
            conversationId: 1,
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
          }
        }
      ] );

    } );

    test( 'list conversations with offset and limit', async () => {

      const conversations = await Inboxes.user( 99999999 ).conversations.list( 1, 3 );

      const result = conversations.toJSON()
        .map( v => _.omit( v, 'createdAt', 'updatedAt', 'resolvedAt', 'closedAt', 'latestMessage.createdAt' ) );

      expect( result ).eql( [
        {
          id: 4,
          type: 'contact_form',
          typeIdentifier: 456789,
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 6,
            identifier: 86286559,
            name: 'L\'admin',
            type: 'user',
            uid: 86286559
          },
          inboxUser: {
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            leftAt: null,
            uid: 99999999
          },
          inboxes: [ {
            id: 6,
            type: 'user',
            identifier: 86286559,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 86286559
          }, {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999
          } ],
          latestMessage: {
            id: 9,
            body: 'J\'en ai marre de vos gueules, j\'me tire d\'ici !',
            conversationId: 4,
            inbox: {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: 'L\'admin',
              avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559
            }
          }
        },
        {
          id: 3,
          type: 'contact_form',
          typeIdentifier: null,
          store: { 'params': {} },
          inboxContextId: 5,
          creatorInbox: {
            id: 5,
            type: 'agenda',
            identifier: 24681012,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            uid: 24681012
          },
          creatorInboxUser: {
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 5,
            inboxId: 5,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            userUid: 99999999
          },
          inboxUser: {
            id: 5,
            inboxId: 5,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            leftAt: null,
            uid: 99999999
          },
          inboxes: [ {
            id: 4,
            type: 'agenda',
            identifier: 7891011,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            uid: 7891011
          }, {
            id: 5,
            type: 'agenda',
            identifier: 24681012,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            uid: 24681012
          } ],
          latestMessage: {
            id: 8,
            body: 'Tu pourrais me demander si je vais bien aussi, tss !',
            conversationId: 3,
            inbox: {
              id: 5,
              type: 'agenda',
              identifier: 24681012,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 24681012
            },
            inboxUser: {
              avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
              id: 5,
              inboxId: 5,
              leftAt: null,
              name: 'Jean-Roger Benbambou',
              uid: 99999999,
              userUid: 99999999,
            }
          }
        },
        {
          id: 2,
          type: 'edition_request',
          typeIdentifier: null,
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999
          },
          creatorInboxUser: {
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 2,
            inboxId: 2,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            userUid: 99999999
          },
          inboxUser: {
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            leftAt: null,
            uid: 99999999
          },
          inboxes: [ {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999
          }, {
            id: 4,
            type: 'agenda',
            identifier: 7891011,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            uid: 7891011
          } ],
          latestMessage: {
            id: 5,
            body: 'Mais voyons Francis, sois poli stp !',
            conversationId: 2,
            inbox: {
              id: 4,
              type: 'agenda',
              identifier: 7891011,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 7891011
            }
          }
        }
      ] );

    } );

    test( 'list conversations filtered by typeIdentifier', async () => {

      const conversations = await Inboxes.user( 99999999 )
        .conversations.list( { type: 'contact_form', typeIdentifier: 456789 } );

      const result = conversations.toJSON()
        .map( v => _.omit( v, 'createdAt', 'updatedAt', 'resolvedAt', 'closedAt', 'latestMessage.createdAt' ) );

      expect( result ).eql( [
        {
          id: 4,
          type: 'contact_form',
          typeIdentifier: 456789,
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            id: 6,
            type: 'user',
            identifier: 86286559,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 86286559
          },
          inboxUser: {
            avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 2,
            inboxId: 2,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            userUid: 99999999
          },
          inboxes: [ {
            id: 6,
            type: 'user',
            identifier: 86286559,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 86286559
          }, {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: 'L\'admin',
            avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999
          } ],
          latestMessage: {
            id: 9,
            body: 'J\'en ai marre de vos gueules, j\'me tire d\'ici !',
            conversationId: 4,
            inbox: {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: 'L\'admin',
              avatar: 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559
            }
          }
        },
      ] );

    } );

    test( 'list conversations of a deleted inbox user', async () => {

      const conversations = await new Inboxes.user( 86286559 ).conversations.list();

      expect( conversations.toJSON() ).eql( [] );

    } );

  } );

  describe( 'action', () => {

    beforeAll( async () => {

      await init( {
        ...testconfig,
        mysql: { ...testconfig.mysql, database },
        types: {
          contact_form: {
            actions: [ {
              code: 'accept',
              label: {
                fr: 'Accepter',
                en: 'Accept'
              },
              kind: 'success'
            }, {
              code: 'refuse',
              label: {
                fr: 'Refuser',
                en: 'Refuse'
              },
              kind: 'danger'
            } ]
          }
        }
      } );

    } );

    it( 'trigger an action', async () => {

      const spy = sinon.spy( config.interfaces, 'onAction' );

      await Inboxes( 4 ).conversations.action( 3, 'accept', { userUid: 89216486 } );

      sinon.assert.calledOnce( spy );
      sinon.assert.calledWith(
        spy,
        sinon.match( { id: 3 } ),
        sinon.match( { code: 'accept' } )
      );

      spy.restore();

    } );

    it( 'trigger an action', async () => {

      const spy = sinon.spy( config.interfaces, 'onAction' );

      try {
        await Inboxes( 4 ).conversations.action( 3, 'accept', { userUid: 99999999 } );
      } catch ( e ) {
        expect( e.message ).eql( 'InboxUser { userUid: 99999999 } not found in Inbox { id: 4 }' );
      }

      spy.restore();

    } );

  } );

} );
