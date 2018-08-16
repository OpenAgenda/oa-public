"use strict";

const { promisify } = require( 'util' );
const wn = require( 'when/node' );
const _ = require( 'lodash' );
const { default: inboxes, Conversation } = require( '@openagenda/inboxes' );
const inboxMw = require( '@openagenda/inboxes/dist/middleware' );
const usersSvc = require( '@openagenda/users' );
const agendasSvc = require( '@openagenda/agendas' );
const agendaEventsSvc = require( '@openagenda/agenda-events' );
const stakeholdersSvc = require( '@openagenda/agenda-stakeholders' );
const log = require( '@openagenda/logs' )( 'services/inboxes' );
const inboxesLabels = require( '@openagenda/labels/inboxes' );
const onMessageCreate = require( './onMessageCreate' );
const config = require( '../../config' );


const loggerConfig = config.getLogConfig( 'oa', 'inboxes', false );

log.setConfig( loggerConfig );


async function getUsersDetails( usersToBeDetailed ) {

  if ( usersToBeDetailed.length === 0 ) {
    return [];
  }

  return (await usersSvc.find( {
    query: {
      uid: {
        $in: usersToBeDetailed.map( v => v.userUid )
      },
      $skip: 0,
      $limit: 100
    },
    removed: null
  } ))
    .data
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
  const supportToBeDetailed = inboxesToBeDetailed.filter( v => v.type === 'support' );

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
  const supports = supportToBeDetailed.map( v => ({
    ...v,
    uid: 1,
    name: 'Support - OpenAgenda',
    avatar: config.aws.oaLogoIcon
  }) );

  return [ ...users, ...agendas, ...supports ];
}

async function onInboxCreate( Inbox ) {
  switch ( Inbox.data.type ) {
    case 'user': {
      const inboxUser = await Inbox.users.add( { userUid: Inbox.data.identifier } );

      if ( !inboxUser.data ) {
        log( 'warn', 'Cannot get/create InboxUser (%j) on inbox (%j)', { userUid: Inbox.data.identifier }, Inbox.data );
      }

      break;
    }
    case 'agenda': {
      // get all adminmods
      // create inboxUsers

      const agendaGet = promisify( agendasSvc.get );
      const agenda = await agendaGet(
        { uid: Inbox.data.identifier },
        { private: null, internal: true }
      );

      if ( !agenda ) {
        log( 'warn', 'Cannot retrieve agenda %j', { uid: Inbox.data.identifier } );
        break;
      }

      const stakeholders = [];
      const limit = 100;
      let pos = 0;
      let result;
      const shList = () => promisify( stakeholdersSvc.agenda( agenda.id ).list )(
        { credentials: [ 'administrator', 'moderator' ] },
        pos,
        limit,
        { deletedUser: false }
      );

      while ( result = await shList() ) {
        if ( !result.length ) break;
        pos = pos + limit;

        Array.prototype.push.apply( stakeholders, result );
      }

      pos = 0;
      const users = [];
      const userIds = _.map( stakeholders, 'userId' );

      while ( result = (await usersSvc.find( {
        query: {
          id: { $in: userIds },
          $skip: pos,
          $limit: limit
        },
        removed: null
      })).data ) {
        if ( !result.length ) break;
        pos = pos + limit;

        Array.prototype.push.apply( users, result );
      }

      for ( const user of users ) {
        await Inbox.users.add( { userUid: user.uid } );
      }

      break;
    }
  }
}

async function filterAction( inbox, conversation, action ) {
  if ( action.code === 'involveTechnicalSupport' ) {
    if ( inbox.type !== 'agenda' ) {
      return false;
    }

    const user = await usersSvc.get( conversation.inboxUser.userUid, { removed: null } );

    const agenda = await promisify( agendasSvc.get )(
      { uid: inbox.identifier },
      { private: null, internal: true }
    );

    const sh = await promisify( stakeholdersSvc.agenda( agenda.id ).get )( { userId: user.id } );

    if ( !sh || !stakeholdersSvc.types.isSuperiorTo( sh.credential, stakeholdersSvc.types.get( 'moderator' ), true ) ) {
      return false;
    }

    return !conversation.inboxes.find( inbox => inbox.type === 'support' );
  }

  if ( action.code === 'removeTechnicalSupport' ) {
    if ( inbox.type === 'support' ) {
      return !!conversation.inboxes.find( inbox => inbox.type === 'support' );
    }

    if ( inbox.type !== 'agenda' ) {
      return false;
    }

    const user = await usersSvc.get( conversation.inboxUser.userUid, { removed: null } );

    const agenda = await promisify( agendasSvc.get )(
      { uid: inbox.identifier },
      { private: null, internal: true }
    );

    const sh = await promisify( stakeholdersSvc.agenda( agenda.id ).get )( { userId: user.id } );

    if ( !sh || !stakeholdersSvc.types.isSuperiorTo( sh.credential, stakeholdersSvc.types.get( 'moderator' ), true ) ) {
      return false;
    }

    return !!conversation.inboxes.find( inbox => inbox.type === 'support' );
  }

  switch ( conversation.type ) {
    case 'contact_form':
      return inbox.type === 'agenda';
    case 'event':
      return inbox.type === 'agenda';
    case 'request_contribute':
      return inbox.type === 'agenda';
    case 'edition_request':
      return inbox.type === 'user';
    default:
      return true;
  }
}

async function onAction( conversation, action ) {
  if ( action.code === 'involveTechnicalSupport' ) {
    const supportInbox = await inboxes( {
      type: 'support',
      identifier: 1
    } ).get();

    await Conversation.link( { conversationId: conversation.id, inboxId: supportInbox.data.id } );
  }

  if ( action.code === 'removeTechnicalSupport' ) {
    const supportInbox = await inboxes( {
      type: 'support',
      identifier: 1
    } ).get();

    await Conversation.unlink( { conversationId: conversation.id, inboxId: supportInbox.data.id } );
  }

  switch ( conversation.type ) {
    case 'request_contribute': {

      if ( action.code === 'accept' ) {

        if ( conversation.creatorInbox && conversation.creatorInbox.type === 'user' ) {

          try {

            const user = await usersSvc.get( conversation.creatorInbox.identifier, { removed: null } );
            const agenda = await promisify( agendasSvc.get )(
              { uid: conversation.typeIdentifier },
              { private: null, internal: true }
            );

            const sh = await promisify( stakeholdersSvc.agenda( agenda.id ).get )( { userId: user.id } );

            if ( !sh ) {

              const sh = await promisify( stakeholdersSvc.agenda( agenda.id ).create )(
                { email: user.email },
                { allowPartial: true }
              );

              log( 'info', 'Contribution request accepted', { stakeholder: sh } );

            }

          } catch ( err ) {

            log( 'error', 'Cannot accept a contribution request', err );

          }

        }

      }

    }
    case 'edition_request': {

      if ( action.code === 'accept' ) {

        try {

          await agendaEventsSvc( conversation.store.params.agendaUid )
            .update(
              conversation.typeIdentifier,
              { canEdit: true },
              { transferToLegacy: true }
            );

          log( 'info', 'Edition rights request accepted', {
            agendaUid: conversation.store.params.agendaUid,
            eventUid: conversation.typeIdentifier
          } );

        } catch ( err ) {

          log( 'error', 'Cannot accept an edition rights request', err );

        }

      }

    }
  }
}

const interfaces = {
  getUsersDetails,
  getInboxesDetails,
  onInboxCreate,
  onMessageCreate,
  filterAction,
  onAction
};

module.exports.init = async c => {
  await inboxes.init(
    _.merge(
      _.pick( c, [
        'mysql',
        'knex',
        'redis',
        'schemas.inbox',
        'schemas.inboxUser',
        'schemas.conversation',
        'schemas.inboxConversation',
        'schemas.message',
        'schemas.messageAttachment',
        'queues.inboxesSync',
        'aws'
      ] ),
      {
        logger: loggerConfig,
        migrations: {
          tableName: 'inboxes_migrations'
        },
        services: {
          agendas: agendasSvc,
          stakeholders: stakeholdersSvc,
          users: usersSvc
        },
        interfaces,
        defaultAction: {
          code: 'default',
          label: {
            fr: 'Fermer la conversation',
            en: 'Close the conversation'
          },
          kind: 'success'
        },
        types: {
          event: {
            actions: [ {
              code: 'involveTechnicalSupport',
              label: {
                fr: 'Impliquer le support technique',
                en: 'Involve technical support'
              },
              kind: 'default',
              resolve: false
            }, {
              code: 'removeTechnicalSupport',
              label: {
                fr: 'Retirer le support technique',
                en: 'Remove technical support'
              },
              kind: 'default',
              resolve: false
            } ]
          },
          contact_form: {
            actions: [ {
              code: 'involveTechnicalSupport',
              label: {
                fr: 'Impliquer le support technique',
                en: 'Involve technical support'
              },
              kind: 'default',
              resolve: false
            }, {
              code: 'removeTechnicalSupport',
              label: {
                fr: 'Retirer le support technique',
                en: 'Remove technical support'
              },
              kind: 'default',
              resolve: false
            } ]
          },
          request_contribute: {
            actions: [ {
              code: 'accept',
              label: {
                fr: 'Ajouter en tant que contributeur',
                en: 'Add as a contributor'
              },
              kind: 'primary',
              confirmationModalTitle: inboxesLabels.requestContributeAcceptModalTitle,
              confirmationModalLabel: inboxesLabels.requestContributeAcceptModal
            }, {
              code: 'refuse',
              label: {
                fr: 'Refuser la demande',
                en: 'Refuse the request'
              },
              kind: 'danger',
              confirmationModalTitle: inboxesLabels.requestContributeRefuseModalTitle,
              confirmationModalLabel: inboxesLabels.requestContributeRefuseModal
            } ]
          },
          edition_request: {
            actions: [ {
              code: 'accept',
              label: {
                fr: 'Accepter la demande',
                en: 'Accept the request'
              },
              kind: 'primary',
              confirmationModalTitle: inboxesLabels.editionRequestAcceptModalTitle,
              confirmationModalLabel: inboxesLabels.editionRequestAcceptModal
            }, {
              code: 'refuse',
              label: {
                fr: 'Refuser la demande',
                en: 'Refuse the request'
              },
              kind: 'danger',
              confirmationModalTitle: inboxesLabels.editionRequestRefuseModalTitle,
              confirmationModalLabel: inboxesLabels.editionRequestRefuseModal
            } ]
          },
          suggest_location_change: {},
          contact_member: {},
          support: {}
        },
        defaultImagePath: c.aws.defaultImagePath
      } )
  );
  await inboxMw.init( _.merge( {}, c, { interfaces, mw: { limit: 20 } } ) );
};
