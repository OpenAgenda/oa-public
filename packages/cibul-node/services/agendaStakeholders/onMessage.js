"use strict";

const { callbackify, promisify } = require( 'util' );
const makeLabelGetter = require( '@openagenda/labels' );
const getMailerLabel = makeLabelGetter( require( '@openagenda/labels/components/mailer' ) );
const agendas = require( '@openagenda/agendas' );
const invitations = require( '@openagenda/invitations' );
const mails = require( '@openagenda/mails' );
const users = require( '@openagenda/users' );
const unsubscribedSvc = require( '@openagenda/unsubscribed' );
const genUrl = require( '../genUrl' );
const config = require( '../../config' );

let log = console.log;

module.exports = ( stakeholder, message, context, cb ) => {

  if ( stakeholder.deletedUser ) return cb();

  agendas.get( stakeholder.agendaId, { includeImagePath: true, private: null }, ( err, agenda ) => {

    if ( err ) log( 'error', err );

    if ( stakeholder.userId && stakeholder.custom.email ) {

      // Member
      users.findOne( {
        query: {
          id: stakeholder.userId
        },
        detailed: true
      } )
        .then( async user => {
          if ( await promisify( unsubscribedSvc( user.uid ).is )( {
            type: 'message',
            subject: 'stakeholder',
            identifier: stakeholder.id
          } ) ) {
            return cb();
          }

          const unsubscribeLink = unsubscribedSvc.app.genUrl( 'add', {
            userUid: user.uid,
            type: 'message',
            subject: 'stakeholder',
            identifier: stakeholder.id
          } );

          const lang = context.lang || 'fr';

          _sendMessageEmail(
            {
              agenda,
              url: genUrl( 'agendaShow', { slug: agenda.slug }, {
                abs: true,
                protocol: 'https://'
              } ),
              message,
              recipient: stakeholder.custom.email,
              replyTo: context.replyTo,
              lang,
              unsubscribeLink
            },
            cb
          );
        } );

    } else if ( stakeholder.userId ) {

      // User without custom.email
      users.findOne( {
        query: {
          id: stakeholder.userId
        },
        detailed: true
      } )
        .then( async user => {

          if ( !user ) return cb();

          if ( await promisify( unsubscribedSvc( user.uid ).is )( {
            type: 'message',
            subject: 'stakeholder',
            identifier: stakeholder.id
          } ) ) {
            return cb();
          }

          const unsubscribeLink = unsubscribedSvc.app.genUrl( 'add', {
            userUid: user.uid,
            type: 'message',
            subject: 'stakeholder',
            identifier: stakeholder.id
          } );

          const lang = context.lang || 'fr';

          _sendMessageEmail(
            {
              agenda,
              url: genUrl( 'agendaShow', { slug: agenda.slug }, { abs: true, protocol: 'https://' } ),
              message,
              recipient: user.email,
              replyTo: context.replyTo,
              lang,
              unsubscribeLink
            },
            cb
          );

        } )
        .catch( () => {

          cb();

        } );

    } else if ( stakeholder.custom.email ) {

      // Invited
      invitations.get( { email: stakeholder.custom.email } )
        .then( async ( { invitation } ) => {

          if ( !invitation ) {

            return cb();

          }

          if ( await promisify( unsubscribedSvc( 0 ).is )( {
            type: 'message',
            subject: 'stakeholder',
            identifier: stakeholder.id
          } ) ) {
            return cb();
          }

          const unsubscribeLink = unsubscribedSvc.app.genUrl( 'add', {
            userUid: 0,
            type: 'message',
            subject: 'stakeholder',
            identifier: stakeholder.id
          } );

          const action = invitation.data.actions.find( v => v.name === 'linkStakeholder' );
          const contextInvitation = action.params[ 1 ] || context;

          const lang = ( contextInvitation && contextInvitation.lang ) || 'fr';

          const url = genUrl( 'signup', {
            invitation: invitation.token,
            email: stakeholder.custom.email,
            lang
          }, {
            abs: true,
            protocol: 'https://'
          } );

          _sendMessageEmail(
            {
              agenda,
              url,
              message,
              recipient: stakeholder.custom.email,
              replyTo: context.replyTo,
              lang,
              unsubscribeLink
            },
            cb
          );

        } );

    }

  } );

};

module.exports.setLog = l => log = l;


function _sendMessageEmail( { agenda, url, unsubscribeLink, message, recipient, lang, replyTo }, cb ) {

  const logo = agenda.image
    ? {
      src: agenda.image.replace( '.com/', '.com/rwtb' ),
      width: '100px'
    }
    : {
      src: `${config.root}/images/openagenda.png`,
      width: '300px'
    };

  callbackify( mails ).call( mails, {
    template: 'stakeholderMessage',
    to: recipient,
    from: replyTo || getMailerLabel( 'noReply', lang ),
    replyTo: replyTo || getMailerLabel( 'noReply', lang ),
    data: {
      logo,
      agenda: agenda.title,
      link: url,
      message,
      unsubscribeLink: config.root + unsubscribeLink
    },
    lang
  }, cb );

}
