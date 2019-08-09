"use strict";

const _ = require( 'lodash' );
const qs = require( 'qs' );

const mails = require( '@openagenda/mails' );
const invitations = require( '@openagenda/invitations' );

const log = require( '@openagenda/logs' )( 'services/members/messages' );

const agendaLogo = require( './agendaLogo' );
const invitationContext = require( './invitationContext' );

module.exports = ( config, { queues, members } ) => {
  const queue = queues( 'memberMessages' );

  return Object.assign(
    ( query, data ) => queue( 'stream', query, data ), {
      task: task.bind( null, config, { queue, members } )
    } );
}

async function task( config, { queue, members } ) {
  log( 'task' );
  queue.register( {
    stream: ( query, data ) => members
      .stream( Object.assign( {}, query, {
        withActions: data.withActions,
        deletedUsers: false,
      }, {}, { detailed: true } ) )
      .on( 'data', member => queue( 'sendMessage', member, data ) ),
    sendMessage: _sendMessage.bind( null, config )
  } );

  queue.on( 'error', ( fn, args, error ) => log( 'error', fn, args, error ) );
  queue.on( 'execute', ( fn, args ) => {} );
  queue.on( 'success', ( fn, args, result ) => log( fn, 'success' ) );

  queue.run();
}


async function _sendMessage( config, member, { message, agenda, lang, replyTo } ) {
  const email = _.get(
    member,
    'custom.email',
    _.get( member, 'user.email' )
  );

  if ( !email ) {
    return log( 'member is not associated to an email' );
  }

  const invitation = await _loadInvitation( member );

  const appliedLang = invitation
    ? invitationContext.getLang( invitation, lang )
    : lang;

  const link = invitation
    ? `${config.root}/${agenda.slug}/signup?${qs.stringify( {
      invitation: invitation.token,
      email,
      lang: appliedLang
    } )}`
    : `${config.root}/${agenda.slug}?lang=${appliedLang}`;

  return mails( {
    template: 'memberMessage',
    to: {
      address: email,
      unsubscriptions: [ {
        rule: [ 'receive', 'memberMessage' ],
        dataPath: 'unsubscribeLink'
      } ].concat( member.userUid ? [ {
        memberId: member.id,
        rule: [ 'receive', 'memberMessage' ],
        dataPath: 'memberUnsubscribeLink'
      } ] : [] )
    },
    replyTo,
    data: {
      logo: agendaLogo( config, agenda ),
      link,
      agenda: agenda.title,
      message
    },
    lang: appliedLang
  } );
}

async function _loadInvitation( member ) {
  if ( member.userUid ) return null;
  if ( !_.get( member, 'custom.email' ) ) return null;

  return invitations
    .get( { email: member.custom.email } )
    .then( r => r ? r.invitation : null );
}
