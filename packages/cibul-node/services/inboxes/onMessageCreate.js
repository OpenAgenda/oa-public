"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const wn = require( 'when/node' );
const { Inbox, InboxUsers } = require( '@openagenda/inboxes' );
const usersSvc = require( '@openagenda/users' );
const agendasSvc = require( '@openagenda/agendas' );
const stakeholdersSvc = require( '@openagenda/agenda-stakeholders' );
const mails = require( '@openagenda/mails' );
const unsubscribed = require( '@openagenda/unsubscribed' );
const makeLabelGetter = require( '@openagenda/labels' );
const getInboxLabel = makeLabelGetter( require( '@openagenda/labels/inboxes/mail' ) );
const log = require( '@openagenda/logs' )( 'services/inboxes/onMessageCreate' );
const genUrl = require( '../genUrl' );
const config = require( '../../config' );

module.exports = async ( conversation, message ) => {

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

  // check if is unsubscribed
  const isUnsubscribed = await wn.call(
    unsubscribed( user.uid ).is,
    agenda ? {
      subject: 'agenda',
      type: 'inbox',
      identifier: agenda.uid
    } : {
      subject: 'home',
      type: 'inbox'
    }
  );

  if ( isUnsubscribed ) {
    return;
  }

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

  const footerActions = getFooterActions( { agenda, stakeholder, user, lang } );

  return mails( {
    template: 'inboxMessage',
    to: user.email,
    data: {
      subject,
      logo,
      agenda,
      link,
      senderName,
      footerActions,
      message: message.body
    },
    lang
  } );
}

function getFooterActions( { agenda, stakeholder, user, lang } ) {
  if ( agenda && stakeholder ) {
    return [ {
      text: getInboxLabel( 'unsubscribeInboxAgenda', lang ),
      link: config.root + unsubscribed.app.genUrl( 'add', {
        userUid: user.uid,
        subject: 'agenda',
        type: 'inbox',
        identifier: agenda.uid
      } )
    }, {
      text: getInboxLabel( 'unsubscribeAgenda', lang ),
      link: config.root + unsubscribed.app.genUrl( 'add', {
        userUid: user.uid,
        subject: 'agenda',
        identifier: agenda.uid
      } )
    } ];
  } else if ( agenda ) {
    return [ {
      text: getInboxLabel( 'unsubscribeInboxAgenda', lang ),
      link: config.root + unsubscribed.app.genUrl( 'add', {
        userUid: user.uid,
        subject: 'agenda',
        type: 'inbox',
        identifier: agenda.uid
      } )
    }, {
      text: getInboxLabel( 'unsubscribeInboxHome', lang ),
      link: config.root + unsubscribed.app.genUrl( 'add', {
        userUid: user.uid,
        subject: 'home',
        type: 'inbox'
      } )
    } ];
  } else {
    return [ {
      text: getInboxLabel( 'unsubscribeInboxHome', lang ),
      link: config.root + unsubscribed.app.genUrl( 'add', {
        userUid: user.uid,
        subject: 'home',
        type: 'inbox'
      } )
    } ];
  }
}
