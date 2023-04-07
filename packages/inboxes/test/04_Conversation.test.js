import _ from 'lodash';
import knexLib from 'knex';
import testconfig from '../testconfig';
import init, { initAndLoad, seed } from './service';

const database = `${testconfig.mysql.database}_Conversation`;
const tables = [
  'inbox',
  'inboxUser',
  'conversation',
  'inboxConversation',
  'message',
];

describe('Conversation', () => {
  let service;
  let Inbox;
  let Conversations;
  let Conversation;

  let knex;

  beforeAll(() => {
    knex = knexLib({
      schemas: testconfig.schemas,
      client: 'mysql',
      connection: {
        ...testconfig.mysql,
        database,
      },
    });
  });

  beforeAll(async () => {
    service = await initAndLoad(
      {
        ...testconfig,
        mysql: { ...testconfig.mysql, database },
        knex,
      },
      []
    );

    ({ Inbox, Conversations, Conversation } = service);
  });

  beforeEach(async () => {
    await service.config.knex.transaction(async trx => {
      await trx.raw('SET foreign_key_checks = 0');
      for (const table of tables) {
        await trx(service.config.schemas[table]).truncate();
      }
      await trx.raw('SET foreign_key_checks = 1');
    });

    await seed(
      {
        ...testconfig,
        mysql: { ...testconfig.mysql, database },
      },
      tables
    );
  });

  afterAll(async () => {
    await service.config.knex.raw(`DROP DATABASE IF EXISTS ${database}`);
    await service.config.knex.destroy();
  });

  describe('create', () => {
    test('create a conversation with a message - by inboxes endpoint', async () => {
      const conversation = await new Inbox(1).conversations.create({
        destinationInbox: { type: 'user', identifier: 99999999 },
        type: 'event',
        typeIdentifier: '456789',
        params: { trucUtile: false },
        creatorInboxUser: { userUid: 23456789 },
        message: "Comment qu'on contribute ?",
      });

      expect(
        _.omit(
          conversation.toJSON(),
          'createdAt',
          'updatedAt',
          'resolvedAt',
          'latestMessage.id',
          'latestMessage.createdAt',
          'fileKey',
          'id',
          'latestMessage.conversationId'
        )
      ).toEqual({
        type: 'event',
        typeIdentifier: '456789',
        creatorInbox: {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239,
        },
        creatorInboxUser: {
          avatar:
            'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 1,
          inboxId: 1,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          userUid: 23456789,
          uid: 23456789,
        },
        store: { params: { trucUtile: false } },
        inboxContextId: 1,
        inboxes: [
          {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 1,
            identifier: 48959239,
            name: 'La gargouille',
            type: 'agenda',
            uid: 48959239,
          },
          {
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 2,
            identifier: 99999999,
            name: "L'admin",
            type: 'user',
            uid: 99999999,
          },
        ],
        latestMessage: {
          body: "Comment qu'on contribute ?",
          attachments: [],
          inbox: {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 1,
            identifier: 48959239,
            name: 'La gargouille',
            type: 'agenda',
            uid: 48959239,
          },
          inboxUser: {
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 1,
            inboxId: 1,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            userUid: 23456789,
            uid: 23456789,
          },
        },
        actions: [
          {
            code: 'defaultAction',
            label: {
              fr: 'Fermer',
              en: 'Close',
            },
            kind: 'success',
          },
        ],
        closedAt: null,
      });
    });

    test('create a conversation - by user endpoint', async () => {
      const conversation = await Inbox.user(99999999).conversations.create({
        destinationInbox: { type: 'agenda', identifier: 48959239 },
        type: 'edition_request',
        params: {},
      });

      expect(
        _.omit(
          conversation.toJSON(),
          'createdAt',
          'updatedAt',
          'resolvedAt',
          'fileKey',
          'id'
        )
      ).toEqual({
        type: 'edition_request',
        typeIdentifier: null,
        creatorInbox: {
          avatar:
            'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
          id: 2,
          identifier: 99999999,
          name: "L'admin",
          type: 'user',
          uid: 99999999,
        },
        creatorInboxUser: {
          avatar:
            'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
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
          avatar:
            'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 2,
          inboxId: 2,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          userUid: 99999999,
          uid: 99999999,
        },
        inboxes: [
          {
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 2,
            identifier: 99999999,
            name: "L'admin",
            type: 'user',
            uid: 99999999,
          },
          {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 1,
            identifier: 48959239,
            name: 'La gargouille',
            type: 'agenda',
            uid: 48959239,
          },
        ],
        latestMessage: null,
        actions: [
          {
            code: 'defaultAction',
            label: {
              fr: 'Fermer',
              en: 'Close',
            },
            kind: 'success',
          },
        ],
        closedAt: null,
      });
    });

    test('create a conversation with an inexistant destinationInbox create the destinationInbox', async () => {
      const conversation = await Inbox.user(99999999).conversations.create({
        destinationInbox: { type: 'agenda', identifier: 456 },
        type: 'edition_request',
        params: {},
      });

      expect(
        _.omit(
          conversation.toJSON(),
          'createdAt',
          'updatedAt',
          'resolvedAt',
          'fileKey',
          'id',
          'inboxes[1].id'
        )
      ).toEqual({
        type: 'edition_request',
        typeIdentifier: null,
        creatorInbox: {
          avatar:
            'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
          id: 2,
          identifier: 99999999,
          name: "L'admin",
          type: 'user',
          uid: 99999999,
        },
        creatorInboxUser: {
          avatar:
            'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
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
          avatar:
            'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 2,
          inboxId: 2,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          userUid: 99999999,
          uid: 99999999,
        },
        inboxes: [
          {
            id: 2,
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            identifier: 99999999,
            name: "L'admin",
            type: 'user',
            uid: 99999999,
          },
          {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            identifier: 456,
            name: 'La gargouille',
            type: 'agenda',
            uid: 456,
          },
        ],
        latestMessage: null,
        actions: [
          {
            code: 'defaultAction',
            label: {
              fr: 'Fermer',
              en: 'Close',
            },
            kind: 'success',
          },
        ],
        closedAt: null,
      });
    });

    test('create a conversation with an inexistant inboxUser and createInboxUserOnNull create the inboxUser', async () => {
      const conversation = await new Inbox(1).conversations.create(
        {
          destinationInbox: { type: 'user', identifier: 99999999 },
          type: 'event',
          typeIdentifier: 456789,
          creatorInboxUser: { userUid: 85878525 },
        },
        {
          createInboxUserOnNull: true,
        }
      );

      expect(
        _.omit(
          conversation.toJSON(),
          'createdAt',
          'updatedAt',
          'resolvedAt',
          'fileKey',
          'id',
          'creatorInboxUser.id'
        )
      ).toEqual({
        type: 'event',
        typeIdentifier: '456789',
        creatorInbox: {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239,
        },
        creatorInboxUser: {
          avatar:
            'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          inboxId: 1,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          userUid: 85878525,
          uid: 85878525,
        },
        store: { params: {} },
        inboxContextId: 1,
        inboxes: [
          {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 1,
            identifier: 48959239,
            name: 'La gargouille',
            type: 'agenda',
            uid: 48959239,
          },
          {
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 2,
            identifier: 99999999,
            name: "L'admin",
            type: 'user',
            uid: 99999999,
          },
        ],
        latestMessage: null,
        actions: [
          {
            code: 'defaultAction',
            label: {
              fr: 'Fermer',
              en: 'Close',
            },
            kind: 'success',
          },
        ],
        closedAt: null,
      });
    });
  });

  describe('get', () => {
    test('get a conversation - by inboxes endpoint', async () => {
      const conversation = await new Inbox(4).conversations.get(3);

      expect(
        _.omit(
          conversation.toJSON(),
          'createdAt',
          'updatedAt',
          'resolvedAt',
          'latestMessage.createdAt',
          'fileKey'
        )
      ).toEqual({
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
          uid: 24681012,
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
          },
        ],
        latestMessage: {
          body: 'Tu pourrais me demander si je vais bien aussi, tss !',
          conversationId: 3,
          id: 8,
          attachments: [],
          inbox: {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 5,
            identifier: 24681012,
            name: 'La gargouille',
            type: 'agenda',
            uid: 24681012,
          },
        },
        actions: [
          {
            code: 'defaultAction',
            label: {
              fr: 'Fermer',
              en: 'Close',
            },
            kind: 'success',
          },
        ],
        closedAt: null,
      });
    });

    test('get a conversation - by user endpoint', async () => {
      const conversation = await Inbox.user(99999999).conversations.get(1);

      expect(
        _.omit(
          conversation.toJSON(),
          'createdAt',
          'updatedAt',
          'resolvedAt',
          'latestMessage.createdAt',
          'fileKey'
        )
      ).toEqual({
        id: 1,
        type: 'contribution_request',
        typeIdentifier: null,
        creatorInbox: {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239,
        },
        store: { params: {} },
        inboxContextId: 2,
        inboxUser: {
          avatar:
            'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 2,
          inboxId: 2,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          uid: 99999999,
          userUid: 99999999,
        },
        inboxes: [
          {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 1,
            identifier: 48959239,
            name: 'La gargouille',
            type: 'agenda',
            uid: 48959239,
          },
          {
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 2,
            identifier: 99999999,
            name: "L'admin",
            type: 'user',
            uid: 99999999,
          },
        ],
        latestMessage: {
          id: 2,
          body: 'Si tu ne sais pas tu ne fais pas, tampis pour toi ! 🙌',
          conversationId: 1,
          attachments: [],
          inboxUser: {
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            leftAt: null,
            uid: 99999999,
          },
          inbox: {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: "L'admin",
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999,
          },
        },
        actions: [
          {
            code: 'accept',
            label: {
              fr: 'Accepter',
              en: 'Accept',
            },
            kind: 'success',
          },
          {
            code: 'refuse',
            label: {
              fr: 'Refuser',
              en: 'Refuse',
            },
            kind: 'danger',
          },
        ],
        closedAt: null,
      });
    });

    test("get a conversation that isn't in the inbox", async () => {
      const conversation = await new Inbox({
        type: 'user',
        identifier: 45645678,
      }).conversations.get(1);

      expect(conversation.toJSON()).toBeNull();
    });
  });

  describe('update', () => {
    test('update a conversation', async () => {
      const conversation = await Inbox.user(99999999).conversations.get(1);
      const updatedAtBefore = new Date(conversation.toJSON().updatedAt);

      const date = new Date(
        parseInt(`${new Date().getTime().toString().slice(0, -3)}000`, 10)
      );

      await conversation.update({
        params: { un: { nouveau: 'truc' } },
        closedAt: date,
      });

      expect(
        _.omit(
          conversation.toJSON(),
          'createdAt',
          'latestMessage.createdAt',
          'fileKey',
          'updatedAt'
        )
      ).toEqual({
        id: 1,
        type: 'contribution_request',
        typeIdentifier: null,
        creatorInbox: {
          avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          id: 1,
          identifier: 48959239,
          name: 'La gargouille',
          type: 'agenda',
          uid: 48959239,
        },
        store: { params: { un: { nouveau: 'truc' } } },
        resolvedAt: null,
        closedAt: date,
        inboxContextId: 2,
        inboxUser: {
          avatar:
            'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          id: 2,
          inboxId: 2,
          leftAt: null,
          name: 'Jean-Roger Benbambou',
          uid: 99999999,
          userUid: 99999999,
        },
        inboxes: [
          {
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            id: 1,
            identifier: 48959239,
            name: 'La gargouille',
            type: 'agenda',
            uid: 48959239,
          },
          {
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 2,
            identifier: 99999999,
            name: "L'admin",
            type: 'user',
            uid: 99999999,
          },
        ],
        latestMessage: {
          id: 2,
          body: 'Si tu ne sais pas tu ne fais pas, tampis pour toi ! 🙌',
          conversationId: 1,
          attachments: [],
          inboxUser: {
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            leftAt: null,
            uid: 99999999,
          },
          inbox: {
            id: 2,
            type: 'user',
            identifier: 99999999,
            name: "L'admin",
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999,
          },
        },
        actions: [],
      });

      expect(date.getTime() - updatedAtBefore.getTime()).toBeGreaterThan(1000);
      expect(
        new Date(conversation.toJSON().updatedAt).getTime() - date.getTime()
      ).toBeLessThanOrEqual(1000);
    });

    it('update params', async () => {
      const conversation = await new Inbox(4).conversations.update(
        3,
        { params: { un: { nouveau: 'truc' } } },
        { userUid: 89216486 }
      );

      expect(conversation.data.store).toEqual({
        params: { un: { nouveau: 'truc' } },
      });
    });
  });

  describe('list', () => {
    test('list conversations of an inbox', async () => {
      const conversations = await new Inbox({
        type: 'agenda',
        identifier: 48959239,
      }).conversations.list();

      const result = conversations
        .toJSON()
        .map(v => _.omit(
          v,
          'createdAt',
          'updatedAt',
          'resolvedAt',
          'closedAt',
          'latestMessage.createdAt',
          'fileKey'
        ));

      expect(result).toEqual([
        {
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
            uid: 48959239,
          },
          creatorInboxUser: {
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 1,
            inboxId: 1,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            userUid: 23456789,
            uid: 23456789,
          },
          inboxContextId: 1,
          inboxes: [
            {
              id: 1,
              type: 'agenda',
              identifier: 48959239,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 48959239,
            },
            {
              id: 2,
              type: 'user',
              identifier: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 99999999,
            },
          ],
          latestMessage: {
            id: 2,
            body: 'Si tu ne sais pas tu ne fais pas, tampis pour toi ! 🙌',
            conversationId: 1,
            attachments: [],
            inbox: {
              id: 2,
              type: 'user',
              identifier: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 99999999,
            },
          },
        },
        {
          id: 7,
          type: 'contact_form',
          typeIdentifier: null,
          store: { params: {} },
          inboxContextId: 1,
          creatorInboxUser: {
            id: 1,
            inboxId: 1,
            userUid: 23456789,
            leftAt: null,
            uid: 23456789,
            name: 'Jean-Roger Benbambou',
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          },
          creatorInbox: {
            id: 1,
            type: 'agenda',
            identifier: 48959239,
            uid: 48959239,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          },
          latestMessage: null,
          inboxes: [
            {
              id: 1,
              type: 'agenda',
              identifier: 48959239,
              uid: 48959239,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            },
            {
              id: 8,
              type: 'support',
              identifier: 1,
              uid: 1,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            },
            {
              id: 2,
              type: 'user',
              identifier: 99999999,
              uid: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            },
          ],
        },
      ]);
    });

    test('list conversations of a user - with total', async () => {
      const conversations = await Inbox.user(99999999).conversations.list(
        {},
        { total: true }
      );

      const { total, data: result } = conversations.toJSON();

      expect(total).toBe(6);

      expect(
        result.map(v => _.omit(
          v,
          'createdAt',
          'updatedAt',
          'resolvedAt',
          'closedAt',
          'latestMessage.createdAt',
          'fileKey'
        ))
      ).toEqual([
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
            uid: 7891011,
          },
          inboxUser: {
            id: 2,
            inboxId: 2,
            leftAt: null,
            userUid: 99999999,
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
          },
          inboxes: [
            {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559,
            },
            {
              id: 2,
              type: 'user',
              identifier: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 99999999,
            },
          ],
          latestMessage: {
            id: 10,
            body:
              "Salut, j'avais juste envie de vous dire que je vais supprimer mon compte !",
            conversationId: 5,
            attachments: [],
            inbox: {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559,
            },
          },
        },
        {
          id: 4,
          type: 'contact_form',
          typeIdentifier: '456789',
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 6,
            identifier: 86286559,
            name: "L'admin",
            type: 'user',
            uid: 86286559,
          },
          inboxUser: {
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            leftAt: null,
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
          },
          inboxes: [
            {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559,
            },
            {
              id: 2,
              type: 'user',
              identifier: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 99999999,
            },
          ],
          latestMessage: {
            id: 9,
            body: "J'en ai marre de vos gueules, j'me tire d'ici !",
            conversationId: 4,
            attachments: [],
            inbox: {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559,
            },
          },
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
            uid: 24681012,
          },
          creatorInboxUser: {
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 5,
            inboxId: 5,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            userUid: 99999999,
          },
          inboxUser: {
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 5,
            inboxId: 5,
            userUid: 99999999,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
          },
          inboxes: [
            {
              id: 4,
              type: 'agenda',
              identifier: 7891011,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 7891011,
            },
            {
              id: 5,
              type: 'agenda',
              identifier: 24681012,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 24681012,
            },
          ],
          latestMessage: {
            id: 8,
            body: 'Tu pourrais me demander si je vais bien aussi, tss !',
            conversationId: 3,
            attachments: [],
            inbox: {
              id: 5,
              type: 'agenda',
              identifier: 24681012,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 24681012,
            },
            inboxUser: {
              avatar:
                'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
              id: 5,
              inboxId: 5,
              leftAt: null,
              name: 'Jean-Roger Benbambou',
              uid: 99999999,
              userUid: 99999999,
            },
          },
        },
        {
          id: 2,
          type: 'edition_request',
          typeIdentifier: null,
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 2,
            identifier: 99999999,
            name: "L'admin",
            type: 'user',
            uid: 99999999,
          },
          creatorInboxUser: {
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 2,
            inboxId: 2,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            userUid: 99999999,
          },
          inboxUser: {
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            leftAt: null,
          },
          inboxes: [
            {
              id: 2,
              type: 'user',
              identifier: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 99999999,
            },
            {
              id: 4,
              type: 'agenda',
              identifier: 7891011,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 7891011,
            },
          ],
          latestMessage: {
            id: 5,
            body: 'Mais voyons Francis, sois poli stp !',
            conversationId: 2,
            attachments: [],
            inbox: {
              id: 4,
              type: 'agenda',
              identifier: 7891011,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 7891011,
            },
          },
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
            uid: 48959239,
          },
          inboxUser: {
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            leftAt: null,
          },
          inboxes: [
            {
              id: 1,
              type: 'agenda',
              identifier: 48959239,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 48959239,
            },
            {
              id: 2,
              type: 'user',
              identifier: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 99999999,
            },
          ],
          latestMessage: {
            id: 2,
            body: 'Si tu ne sais pas tu ne fais pas, tampis pour toi ! 🙌',
            conversationId: 1,
            attachments: [],
            inboxUser: {
              id: 2,
              inboxId: 2,
              userUid: 99999999,
              name: 'Jean-Roger Benbambou',
              avatar:
                'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
              leftAt: null,
              uid: 99999999,
            },
            inbox: {
              id: 2,
              type: 'user',
              identifier: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 99999999,
            },
          },
        },
        {
          id: 7,
          type: 'contact_form',
          typeIdentifier: null,
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            id: 1,
            type: 'agenda',
            identifier: 48959239,
            uid: 48959239,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
          },
          inboxUser: {
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            leftAt: null,
            uid: 99999999,
            name: 'Jean-Roger Benbambou',
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
          },
          latestMessage: null,
          inboxes: [
            {
              id: 1,
              type: 'agenda',
              identifier: 48959239,
              uid: 48959239,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            },
            {
              id: 8,
              type: 'support',
              identifier: 1,
              uid: 1,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            },
            {
              id: 2,
              type: 'user',
              identifier: 99999999,
              uid: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            },
          ],
        },
      ]);
    });

    test('list conversations with offset and limit', async () => {
      const conversations = await Inbox.user(99999999).conversations.list(1, 3);

      const result = conversations
        .toJSON()
        .map(v => _.omit(
          v,
          'createdAt',
          'updatedAt',
          'resolvedAt',
          'closedAt',
          'latestMessage.createdAt',
          'fileKey'
        ));

      expect(result).toEqual([
        {
          id: 4,
          type: 'contact_form',
          typeIdentifier: '456789',
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            id: 6,
            identifier: 86286559,
            name: "L'admin",
            type: 'user',
            uid: 86286559,
          },
          inboxUser: {
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            leftAt: null,
            uid: 99999999,
          },
          inboxes: [
            {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559,
            },
            {
              id: 2,
              type: 'user',
              identifier: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 99999999,
            },
          ],
          latestMessage: {
            id: 9,
            body: "J'en ai marre de vos gueules, j'me tire d'ici !",
            conversationId: 4,
            attachments: [],
            inbox: {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559,
            },
          },
        },
        {
          id: 3,
          type: 'contact_form',
          typeIdentifier: null,
          store: { params: {} },
          inboxContextId: 5,
          creatorInbox: {
            id: 5,
            type: 'agenda',
            identifier: 24681012,
            name: 'La gargouille',
            avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
            uid: 24681012,
          },
          creatorInboxUser: {
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 5,
            inboxId: 5,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            userUid: 99999999,
          },
          inboxUser: {
            id: 5,
            inboxId: 5,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            leftAt: null,
            uid: 99999999,
          },
          inboxes: [
            {
              id: 4,
              type: 'agenda',
              identifier: 7891011,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 7891011,
            },
            {
              id: 5,
              type: 'agenda',
              identifier: 24681012,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 24681012,
            },
          ],
          latestMessage: {
            id: 8,
            body: 'Tu pourrais me demander si je vais bien aussi, tss !',
            conversationId: 3,
            attachments: [],
            inbox: {
              id: 5,
              type: 'agenda',
              identifier: 24681012,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 24681012,
            },
            inboxUser: {
              avatar:
                'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
              id: 5,
              inboxId: 5,
              leftAt: null,
              name: 'Jean-Roger Benbambou',
              uid: 99999999,
              userUid: 99999999,
            },
          },
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
            name: "L'admin",
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 99999999,
          },
          creatorInboxUser: {
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 2,
            inboxId: 2,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            userUid: 99999999,
          },
          inboxUser: {
            id: 2,
            inboxId: 2,
            userUid: 99999999,
            name: 'Jean-Roger Benbambou',
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            leftAt: null,
            uid: 99999999,
          },
          inboxes: [
            {
              id: 2,
              type: 'user',
              identifier: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 99999999,
            },
            {
              id: 4,
              type: 'agenda',
              identifier: 7891011,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 7891011,
            },
          ],
          latestMessage: {
            id: 5,
            body: 'Mais voyons Francis, sois poli stp !',
            conversationId: 2,
            attachments: [],
            inbox: {
              id: 4,
              type: 'agenda',
              identifier: 7891011,
              name: 'La gargouille',
              avatar: 'https://cibul.s3.amazonaws.com/agenda48959239.jpg',
              uid: 7891011,
            },
          },
        },
      ]);
    });

    test('list conversations filtered by typeIdentifier', async () => {
      const conversations = await Inbox.user(99999999).conversations.list({
        type: 'contact_form',
        typeIdentifier: 456789,
      });

      const result = conversations
        .toJSON()
        .map(v => _.omit(
          v,
          'createdAt',
          'updatedAt',
          'resolvedAt',
          'closedAt',
          'latestMessage.createdAt',
          'fileKey'
        ));

      expect(result).toEqual([
        {
          id: 4,
          type: 'contact_form',
          typeIdentifier: '456789',
          store: { params: {} },
          inboxContextId: 2,
          creatorInbox: {
            id: 6,
            type: 'user',
            identifier: 86286559,
            name: "L'admin",
            avatar:
              'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
            uid: 86286559,
          },
          inboxUser: {
            avatar:
              'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png',
            id: 2,
            inboxId: 2,
            leftAt: null,
            name: 'Jean-Roger Benbambou',
            uid: 99999999,
            userUid: 99999999,
          },
          inboxes: [
            {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559,
            },
            {
              id: 2,
              type: 'user',
              identifier: 99999999,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 99999999,
            },
          ],
          latestMessage: {
            id: 9,
            body: "J'en ai marre de vos gueules, j'me tire d'ici !",
            conversationId: 4,
            attachments: [],
            inbox: {
              id: 6,
              type: 'user',
              identifier: 86286559,
              name: "L'admin",
              avatar:
                'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg',
              uid: 86286559,
            },
          },
        },
      ]);
    });

    test('list conversations of a deleted inbox user', async () => {
      const conversations = await Inbox.user(86286559).conversations.list();

      expect(conversations.toJSON()).toEqual([]);
    });
  });

  describe('action', () => {
    beforeAll(async () => {
      service = await init({
        ...testconfig,
        mysql: { ...testconfig.mysql, database },
        knex,
        types: {
          contact_form: {
            actions: [
              {
                code: 'accept',
                label: {
                  fr: 'Accepter',
                  en: 'Accept',
                },
                kind: 'success',
              },
              {
                code: 'refuse',
                label: {
                  fr: 'Refuser',
                  en: 'Refuse',
                },
                kind: 'danger',
              },
            ],
          },
        },
      });

      ({ Inbox, Conversations, Conversation } = service);
    });

    it('trigger an action', async () => {
      const spy = jest.spyOn(service.config.interfaces, 'onAction');

      await new Inbox(4).conversations.action(3, 'accept', {
        userUid: 89216486,
      });

      expect(spy.mock.calls).toHaveLength(1);
      expect(spy.mock.calls[0]).toMatchObject([{ id: 3 }, { code: 'accept' }]);
    });

    it('trigger another action', async () => {
      await expect(
        new Inbox(4).conversations.action(3, 'accept', { userUid: 99999999 })
      ).rejects.toThrow(
        'InboxUser { userUid: 99999999 } not found in Inbox { id: 4 }'
      );
    });
  });

  describe('link', () => {
    it('link a conversation to an inbox', async () => {
      const inboxId = 1;
      const conversationId = 4;

      await Conversation.link({ inboxId, conversationId });

      const conversation = await new Inbox(inboxId).conversations.get(
        conversationId
      );

      expect(conversation).toBeInstanceOf(Conversation);
    });

    it('cannot create double link', async () => {
      const inboxId = 1;
      const conversationId = 1;

      await Conversation.link({ inboxId, conversationId });
      await Conversation.link({ inboxId, conversationId });

      const result = await service.config
        .knex(service.config.schemas.inboxConversation)
        .select()
        .where({
          inbox_id: inboxId,
          conversation_id: conversationId,
        });

      expect(result).toHaveLength(1);
    });
  });

  describe('unlink', () => {
    it('unlink a conversation to an inbox', async () => {
      const inboxId = 1;
      const conversationId = 1;

      await Conversation.unlink({ inboxId, conversationId });

      const conversation = await new Inbox(inboxId).conversations.get(
        conversationId
      );

      expect(conversation.toJSON()).toBeNull();
    });
  });

  it('get a conversation by the endpoint user when indirectly inboxUser, through an agenda', async () => {
    const conv = await Inbox.user(31046551).conversations.get(6);
    const msg = await conv.messages.get(11);

    expect(msg.data.id).toBe(11);
  });

  it('support get a conversation in which it was added', async () => {
    const conversation = await new Conversations({
      userUid: 32132112,
      inbox: new Inbox({
        type: 'support',
        identifier: 1,
      }),
    }).get(7);

    expect(conversation.toJSON()).toHaveProperty('inboxUser');
  });
});
