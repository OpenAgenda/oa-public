"use strict";

const _ = require( 'lodash' );

const invitations = require( '@openagenda/invitations' );
const mails = require( '@openagenda/mails' );
const members = require( '@openagenda/members' );
const users = require( '@openagenda/users' );

const log = require( '@openagenda/logs' )( 'members/mail' );

const activites = require( '../../activities' );
const agendaLogo = require( './agendaLogo' );
const extractInvitationContext = require( './invitationContext' );

module.exports = {
  sendInvitation,
  send,
  resendInvitation,
  messages: require( './messages' )
};

async function resendInvitation( config, { agenda, member } ) {
  const {
    invitation
  } = await invitations.get( { email: member.custom.email } );

  if ( !invitation ) {
    throw new Error( 'There is no invitation for this member' );
  }

  return sendInvitation( config, { invitation, agenda, member } );
}

async function send( config, { member, context, agenda, message } ) {
  log( 'send' );

  const lang = _.get( context, 'lang', 'fr' );

  return _send( config, {
    member,
    agenda,
    link: `${config.root}/agendas/${agenda.uid}?lang=${lang}`,
    message,
    lang
  } );
}

async function sendInvitation( config, { invitation, member, context, agenda } ) {
  log( 'sendInvitation' );

  const invitationContext = extractInvitationContext( invitation, context );

  try {
    await _createSenderActivity( { agenda, invitationContext, member } );
  } catch ( e ) {
    log( 'error', 'could not create sender activity', e );
  }

  const lang = _.get( invitationContext, 'lang', 'fr' );

  return _send( config, {
    member,
    agenda,
    link: `${config.root}/${agenda.slug}/signup?lang=${lang}&email=${member.custom.email}&invitation=${invitation.token}`,
    message: invitationContext.message,
    lang
  } );
};

function _send( config, { member, agenda, link, message, lang } ) {
  log( 'sending link', link );

  return mails( {
    template: 'memberInvitation',
    to: {
      address: member.custom.email,
      unsubscriptions: [ {
        rule: [ 'receive', 'invitation' ],
        dataPath: 'unsubscribeLink'
      } ]
    },
    data: {
      logo: agendaLogo( config, agenda ),
      link,
      agenda: agenda.title,
      role: members.utils.getRoleSlug( member.role ),
      message,
      isMember: !!member.userUid
    },
    lang
  } );
}

async function _createSenderActivity( { agenda, invitationContext, member } ) {
  const user = await users.findOne( {
    query: {
      uid: invitationContext.sender.userUid
    }
  } );

  if ( !user ) {
    throw new Error( 'Sender not found' );
  }

  return activities.feed( {
    entityType: 'agenda',
    entityUid: agenda.uid
  } ).activities.add( {
    actor: 'user:' + user.uid,
    verb: 'agenda.sendInvitation',
    object: 'email:' + member.custom.email,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: invitationContext.sender.memberName,
        object: member.custom.email,
        target: agenda.title
      },
      credential: member.role
    }
  } );
}
