"use strict";

const { promisify } = require( 'util' );
const wn = require( 'when/node' );
const _ = require( 'lodash' );
const inboxes = require( '@openagenda/inboxes' );
const inboxMw = require( '@openagenda/inboxes/lib/middleware' );
const userSvc = require( '@openagenda/users' );
const agendasSvc = require( '@openagenda/agendas' );
const stakeholdersSvc = require( '@openagenda/agenda-stakeholders' );
const mailer = require( './mailer' );
const config = require( '../config' );

async function getUsersDetails( usersToBeDetailed ) {
  if ( usersToBeDetailed.length === 0 ) {
    return [];
  }

  return (await userSvc.list( { uid: usersToBeDetailed.map( v => v.userUid ) }, 0, 100, { removed: null } ))
    .users
    .map( user => ({
      uid: user.uid,
      name: user.fullName,
      avatar: user.image ? config.aws.imageBucketPath + user.image : config.aws.defaultImagePath
    }) );
}

async function getInboxesDetails( inboxesToBeDetailed ) {
  const usersToBeDetailed = inboxesToBeDetailed
    .filter( v => v.type === 'user' )
    .map( v => ({ userUid: v.identifier }) );
  const agendasToBeDetailed = inboxesToBeDetailed.filter( v => v.type === 'agenda' );

  const users = await getUsersDetails( usersToBeDetailed );
  const agendas = agendasToBeDetailed.length === 0 ? [] : (await wn.call( agendasSvc.list,
    { uid: agendasToBeDetailed.map( v => v.identifier ) },
    {
      private: null,
      includeImagePath: true,
      useDefaultImage: true
    }
  ))[ 0 ].map( v => ({
    uid: v.uid,
    name: v.title,
    avatar: v.image || config.aws.defaultImagePath
  }) );

  return [ ...users, ...agendas ];
}

function filterAction( inbox, conversation, action ) {
  switch ( conversation.type ) {
    case 'contact_form':
    case 'event':
      return inbox.type === 'agenda';
    default:
      return true;
  }
}

async function onInboxCreate( Inbox ) {
  switch ( Inbox.data.type ) {
    case 'user': {
      const inboxUser = await Inbox.users.get( { userUid: Inbox.data.identifier }, { createOnNull: true } );

      if ( !inboxUser.data ) {
        throw new VError(
          'Canno\'t get/create InboxUser (%j) on inbox (%j)',
          { userUid: Inbox.data.identifier },
          Inbox.data
        );
      }
    }
    case 'agenda': {
      // get all adminmods
      // create inboxUsers

      const agendaGet = promisify( agendasSvc.get );
      const agendaId = (await agendaGet(
        { uid: Inbox.data.identifier },
        { private: null, internal: true, deletedUser: false }
      )).id;

      const shList = promisify( stakeholdersSvc.agenda( agendaId ).list );
      const stakeholders = [];
      const limit = 100;
      let pos = 0;
      let result;

      while ( result = await shList( { credentials: [ 'administrator', 'moderator' ] }, pos, limit ) ) {
        if ( !result.length ) break;
        pos = pos + limit;

        Array.prototype.push.apply( stakeholders, result );
      }

      pos = 0;
      const users = [];
      const userIds = _.map( stakeholders, 'userId' );

      while ( result = (await userSvc.list( { id: userIds }, pos, limit, { removed: false } )).users ) {
        if ( !result.length ) break;
        pos = pos + limit;

        Array.prototype.push.apply( users, result );
      }

      for ( const user of users ) {
        await Inbox.users.add( { userUid: user.uid } );
      }
    }
  }

}

async function onMessageCreate( conversation, message ) {
  if ( [ 75052324, 99999999, 31046551, 7339049, 71438739 ].indexOf( message.inboxUser.userUid ) !== -1 ) {
    return;
  }

  mailer.queue.inboxMessage( {
    conversation,
    message
  } );
}

function onAction( conversation, action ) {
  switch ( conversation.type ) {
    case 'event':
    //
  }
}

const interfaces = {
  getUsersDetails,
  getInboxesDetails,
  filterAction,
  onInboxCreate,
  onMessageCreate,
  onAction
};

module.exports.init = async config => {
  await inboxes.init(
    _.merge( config, {
      migrations: {
        tableName: 'inboxes_migrations'
      },
      interfaces,
      types: {
        event: {
          actions: [ {
            code: 'resolve',
            label: {
              fr: 'Terminer',
              en: 'Terminate'
            },
            kind: 'success'
          } ]
        },
        contact_form: {
          actions: [ {
            code: 'resolve',
            label: {
              fr: 'Terminer',
              en: 'Terminate'
            },
            kind: 'success'
          } ]
        }
      }
    } )
  );
  await inboxMw.init( _.merge( config, { interfaces, mw: { limit: 20 } } ) );
};
