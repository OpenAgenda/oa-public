"use strict";

const path = require( 'path' );

module.exports = {
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_inboxes',
    password: 'grut',
    user: 'root',
    charset: 'utf8mb4',
    timezone: 'UTC'
  },
  migrations: {
    tableName: 'inbox_migrations',
    directory: path.resolve( __dirname, 'migrations' )
  },
  schemas: {
    inbox: 'inbox',
    inboxUser: 'inbox_user',
    conversation: 'conversation',
    inboxConversation: 'inbox_conversation',
    message: 'message',
    messageAttachment: 'message_attachment'
  },
  aws: {
    defaultImagePath: `//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png`
  },
  types: {
    contribution_request: {
      description: {
        fr: 'La contribution sur cet agenda n\'est possible que sur invitation',
        en: 'Contribution on this agenda is possible only for invited users'
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
    },
    edition_request: {
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
    },
    event: {}
  },
  interfaces: {
    getInboxesDetails( inboxesToBeDetailed ) {
      return inboxesToBeDetailed.map( inboxToBeDetailed => ({
        uid: inboxToBeDetailed.identifier, // uid is required for re-map
        name: inboxToBeDetailed.type === 'user'
          ? 'L\'admin'
          : 'La gargouille',
        avatar: inboxToBeDetailed.type === 'user'
          ? 'http://www.lets-develop.com/wp-content/themes/olivias_theme/images/custom-avatar-admin.jpg'
          : 'https://cibul.s3.amazonaws.com/agenda48959239.jpg'
      }) );
    },
    getUsersDetails( usersToBeDetailed ) {
      return usersToBeDetailed.map( userToBeDetailed => ({
        uid: userToBeDetailed.userUid, // uid is required for re-map
        name: 'Jean-Roger Benbambou',
        avatar: 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png'
      }) );
    },
    filterAction( inbox, conversation, action ) {
      switch ( conversation.type ) {
        case 'contact_form':
        case 'edition_request':
        case 'event':
          return inbox.type === 'agenda';
        default:
          return true;
      }
    },
    onAction( conversation, action ) {
    }
  },
  mw: {
    limit: 20
  }
};
