"use strict";

const makeLabelGetter = require( '@openagenda/labels' ),

  getInvitationLabel = makeLabelGetter( require( '@openagenda/labels/members/invitation' ) ),

  getMailerLabel = makeLabelGetter( require( '@openagenda/labels/components/mailer' ) ),

  agendas = require( '@openagenda/agendas' ),

  genUrl = require( '../genUrl' ),

  invitations = require( '@openagenda/invitations' ),

  mailer = require( '@openagenda/mailer' ),

  users = require( '@openagenda/users' );

let log = console.log;

module.exports = ( stakeholder, message, context, cb ) => {

  if ( stakeholder.deletedUser ) return cb();

  agendas.get( stakeholder.agendaId, { includeImagePath: true, private: null }, ( err, agenda ) => {

    if ( err ) log( 'error', err );

    if ( stakeholder.userId && stakeholder.custom.email ) {

      // Member
      const lang = context.lang || 'fr';

      _sendMessageEmail(
        {
          agenda,
          url: genUrl( 'agendaShow', { slug: agenda.slug } ),
          linkLabel: getInvitationLabel( 'emailShowAgenda', lang ),
          message,
          recipient: stakeholder.custom.email,
          replyTo: context.replyTo,
          lang
        },
        cb
      );

    } else if ( stakeholder.userId ) {

      // User without custom.email
      users.findOne( {
        query: {
          id: stakeholder.userId
        },
        detailed: true
      } )
        .then( user => {

          if ( !user ) return cb();

          const lang = context.lang || 'fr';

          _sendMessageEmail(
            {
              agenda,
              url: genUrl( 'agendaShow', { slug: agenda.slug }, { abs: true, protocol: 'https://' } ),
              linkLabel: getInvitationLabel( 'emailShowAgenda', lang ),
              message,
              recipient: user.email,
              replyTo: context.replyTo,
              lang
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
        .then( ( { invitation } ) => {

          if ( !invitation ) {

            return cb();

          }

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
              linkLabel: getInvitationLabel( 'emailSignup', lang ),
              message,
              recipient: stakeholder.custom.email,
              replyTo: context.replyTo,
              lang
            },
            cb
          );

        } );

    }

  } );

};

module.exports.setLog = l => log = l;


function _sendMessageEmail( { agenda, url, linkLabel, message, recipient, lang, replyTo }, cb ) {

  mailer( {
    recipient,
    source: replyTo || getMailerLabel( 'noReply', lang ),
    replyTo: replyTo || getMailerLabel( 'noReply', lang ),
    subject: getInvitationLabel( 'newMessage', { agenda: agenda.title }, lang ),
    data: {
      logo: agenda.image ? agenda.image.replace( '.com/', '.com/rwtb' ) : 'https://openagenda.com/images/openagenda.png',
      title: {
        text: getInvitationLabel( 'newMessage', { agenda: agenda.title }, lang ),
        link: url
      },
      action: {
        label: linkLabel,
        link: url
      },
      description: message
    }
  }, cb );

}