"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const wn = require( 'when/node' );
const { Inbox, InboxUsers } = require( '@openagenda/inboxes' );
const usersSvc = require( '@openagenda/users' );
const agendasSvc = require( '@openagenda/agendas' );
const mailer = require( '@openagenda/mailer' );
const unsubscribed = require( '@openagenda/unsubscribed' );
const makeLabelGetter = require( '@openagenda/labels' );
const getMailerLabel = makeLabelGetter( require( '@openagenda/labels/components/mailer' ) );
const getInboxLabel = makeLabelGetter( require( '@openagenda/labels/inboxes/mail' ) );
const log = require( '@openagenda/logs' )( 'mailer/task/inboxMessage' );
const genUrl = require( '../../genUrl' );
const config = require( '../../../config' );

module.exports = async ( { conversation, message }, cb ) => {

  try {

    const [ inboxesAgenda, inboxesUser ] = _.partition( conversation.inboxes, [ 'type', 'user' ] );

    const inboxUsersToNotify = _( [
      ...await inboxIdsToInboxUsers( conversation.inboxes, _.map( inboxesAgenda, 'id' ) ),
      ...await inboxIdsToInboxUsers( conversation.inboxes, _.map( inboxesUser, 'id' ) )
    ] ).reject( [ 'userUid', message.inboxUser.userUid ] ).uniqBy( 'userUid' ).value();

    log( 'sending mails to %d users to notify new message', inboxUsersToNotify.length );

    const chunks = _.chunk( inboxUsersToNotify, 100 );

    for ( const chunk of chunks ) {

      const users = (await usersSvc.list(
        { uid: _.map( chunk, 'userUid' ) },
        0,
        chunk.length,
        { removed: false, detailed: true }
      )).users;

      for ( const user of users ) {

        const inboxUserToNotify = _.chain( inboxUsersToNotify )
          .remove( [ 'userUid', user.uid ] )
          .head()
          .assign( { user } )
          .value();

        const senderName = await getSenderName( { inboxUser: inboxUserToNotify, conversation, message } );

        await sendMail( { inboxUser: inboxUserToNotify, conversation, message, senderName } );

      }

    }

  } catch ( e ) {

    log( 'error', e );

  }

  cb();

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
    return (await promisify( usersSvc.get )( { uid: msg.data.inboxUser.userUid }, {
      removed: false,
      detailed: true
    } )).full_name;
  }

  if ( msg.data.inbox.type === 'agenda' ) {
    return (await promisify( agendasSvc.get )( { uid: msg.data.inbox.identifier }, {
      private: null,
      includeImagePath: true
    } )).title;
  } else if ( msg.data.inbox.type === 'user' ) {
    return (await promisify( usersSvc.get )( { uid: msg.data.inbox.identifier }, {
      removed: false,
      detailed: true
    } )).full_name;
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

async function sendMail( { inboxUser, conversation, message, senderName } ) {
  const mailerAsync = promisify( mailer );
  const getAgenda = promisify( agendasSvc.get );

  const { user, inbox } = inboxUser;
  const { culture: lang = 'fr' } = user;

  const agenda = inbox.type === 'agenda'
    ? await getAgenda( { uid: inbox.identifier }, { private: null, includeImagePath: true } )
    : null;

  const subject = getSubjectLabel( { conversation, agenda, lang } );

  const logo = agenda && agenda.image
    ? agenda.image.replace( '.com/', '.com/rwtb' )
    : 'https://openagenda.com/images/openagenda.png';

  const url = agenda
    ? genUrl.abs( 'agendaAdminInboxConversation', { slug: agenda.slug, conversationId: conversation.id } )
    : genUrl.abs( 'homeInboxConversation', { conversationId: conversation.id } );

  const title = agenda
    ? getInboxLabel( 'newMessageBodyOnAgenda', {
      agenda: agenda.title
    }, lang )
    : getInboxLabel( 'newMessageBody', lang );

  // Ne plus recevoir les notifications de la messagerie de cet agenda (admin, subject: agenda, type: inbox)
  // Ne plus recevoir les notifications de cet agenda (admin, subject: agenda)
  // Ne plus recevoir les notifications de votre messagerie (user, subject: home, type: inbox)
  const footerActions = agenda ? [ {
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
  } ] : [ {
    text: getInboxLabel( 'unsubscribeInboxHome', lang ),
    link: config.root + unsubscribed.app.genUrl( 'add', {
      userUid: user.uid,
      subject: 'home',
      type: 'inbox'
    } )
  } ];

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

  let description = _.escape( message.body );

  if ( senderName ) {
    description = description + `\n\n*${getInboxLabel( 'sentBy', lang )} **${senderName}***`;
  }

  return mailerAsync( {
    recipient: user.email,
    source: getMailerLabel( 'noReply', lang ),
    replyTo: getMailerLabel( 'noReply', lang ),
    subject,
    data: {
      logo,
      title: {
        text: title,
        link: url
      },
      action: {
        label: getInboxLabel( 'newMessageAction', lang ),
        link: url
      },
      description,
      footerActions
    }
  } );
}
