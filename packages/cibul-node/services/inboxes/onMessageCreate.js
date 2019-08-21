"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const { Inbox, InboxUsers } = require( '@openagenda/inboxes' );
const agendasSvc = require( '@openagenda/agendas' );
const stakeholdersSvc = require( '@openagenda/agenda-stakeholders' );
const mails = require( '@openagenda/mails' );
const makeLabelGetter = require( '@openagenda/labels' );
const getInboxLabel = makeLabelGetter( require( '@openagenda/labels/inboxes/mail' ) );
const log = require( '@openagenda/logs' )( 'services/inboxes/onMessageCreate' );
const genUrl = require( '../genUrl' );
const app = require( '../../app' );

module.exports = async ( conversation, message ) => {

  const usersSvc = app.service( '/users' );

  try {

    const [ inboxesAgenda, inboxesUser ] = _.partition( conversation.inboxes, [ 'type', 'user' ] );

    const inboxUsersToNotify = _( [
      ...await inboxIdsToInboxUsers( conversation.inboxes, _.map( inboxesAgenda, 'id' ) ),
      ...await inboxIdsToInboxUsers( conversation.inboxes, _.map( inboxesUser, 'id' ) )
    ] ).reject( [ 'userUid', message.inboxUser.userUid ] ).uniqBy( 'userUid' ).value();

    log( 'sending mails to %d users to notify new message', inboxUsersToNotify.length );

    const chunks = _.chunk( inboxUsersToNotify, 100 );

    for ( const chunk of chunks ) {

      const users = (await usersSvc.find( {
        query: {
          uid: {
            $in: _.map( chunk, 'userUid' )
          },
          $skip: 0,
          $limit: chunk.length
        },
        removed: false,
        detailed: true
      } )).data;

      for ( const user of users ) {

        const inboxUserToNotify = _.chain( inboxUsersToNotify )
          .remove( [ 'userUid', user.uid ] )
          .head()
          .assign( { user } )
          .value();

        await sendMail( { inboxUser: inboxUserToNotify, conversation, message } );

      }

    }

  } catch ( e ) {

    log( 'error', e );

  }

};

async function inboxIdsToInboxUsers( inboxes, ids ) {
  return _.map( (await new InboxUsers().list( {
    inboxId: ids,
    leftAt: false
  }, 0, 10000 )).data, o => ({ ...o, inbox: _.find( inboxes, [ 'id', o.inboxId ] ) }) );
}

async function getSenderName( { inboxUser, conversation, message } ) {
  const usersSvc = app.service( '/users' );
  const conv = await Inbox.user( inboxUser.userUid ).conversations.get( conversation.id );
  const msg = await conv.messages.get( message.id );

  if ( msg.data.inboxUser ) {
    return (await usersSvc.get( msg.data.inboxUser.userUid, { removed: false, detailed: true } )).fullName;
  }

  if ( msg.data.inbox.type === 'agenda' ) {
    return (await promisify( agendasSvc.get )( { uid: msg.data.inbox.identifier }, {
      private: null,
      includeImagePath: true
    } )).title;
  } else if ( msg.data.inbox.type === 'user' ) {
    return (await usersSvc.get( msg.data.inbox.identifier, { removed: false, detailed: true } )).fullName;
  } else if ( msg.data.inbox.type === 'support' ) {
    return 'Support - OpenAgenda';
  }
}

function getSubjectLabel( { conversation, agenda, lang } ) {
  switch ( conversation.type ) {
    case 'contact_form':
      return getInboxLabel( 'emailSubjectContactForm', { agenda: agenda.title }, lang );
    case 'event':
      return getInboxLabel( 'emailSubjectEvent', {
        agenda: agenda.title,
        event: conversation.store.params.eventTitle
      }, lang );
    case 'request_contribute':
      return getInboxLabel( 'emailSubjectRequestContribute', { agenda: agenda.title }, lang );
  }

  return getInboxLabel( 'newMessageSubject', lang );
}

async function sendMail( { inboxUser, conversation, message } ) {
  const getAgenda = promisify( agendasSvc.get );

  const { user } = inboxUser;
  const { culture: lang = 'fr' } = user;

  const agenda = conversation.store.params && conversation.store.params.agendaUid
    ? await getAgenda(
      { uid: conversation.store.params.agendaUid },
      { private: null, includeImagePath: true, internal: true }
    ) : null;

  const subject = getSubjectLabel( { conversation, agenda, lang } );

  const logo = agenda && agenda.image
    ? { src: agenda.image.replace( '.com/', '.com/rwtb' ), width: '100px' }
    : { src: 'https://openagenda.com/images/openagenda.png', width: '300px' };

  const stakeholder = agenda
    ? await promisify( stakeholdersSvc.agenda( agenda.id ).get )( { userId: user.id } )
    : null;

  const isAdminmod = agenda && stakeholder && [ 2, 3 ].includes( stakeholder.credential );

  const link = isAdminmod
    ? genUrl.abs( 'agendaAdminInboxConversation', { slug: agenda.slug, conversationId: conversation.id } )
    : genUrl.abs( 'homeInboxConversation', { conversationId: conversation.id } );

  const senderName = await getSenderName( { inboxUser, conversation, message } );

  const unsubscriptions = agenda
    ? [ {
      rule: [ 'receive', 'agendaInboxMessage' ],
      dataPath: 'unsubscribeLink'
    } ].concat( stakeholder && stakeholder.id ? [ {
      memberId: stakeholder.id,
      rule: [ 'receive', 'agendaInboxMessage' ],
      dataPath: 'memberUnsubscribeLink'
    } ] : [] )
    : [ {
      rule: [ 'receive', 'userInboxMessage' ],
      dataPath: 'unsubscribeLink'
    } ];

  return mails( {
    template: 'inboxMessage',
    to: {
      address: user.email,
      unsubscriptions
    },
    data: {
      subject,
      logo,
      link,
      senderName,
      agenda: agenda ? agenda.title : null,
      message: message.body
    },
    lang
  } );
}
