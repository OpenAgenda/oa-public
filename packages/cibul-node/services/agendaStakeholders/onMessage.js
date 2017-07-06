"use strict";

const makeLabelGetter = require( 'labels' ),

  getMessageLabel = makeLabelGetter( require( 'labels/agenda-stakeholders/message' ) ),

  getInvitationLabel = makeLabelGetter( require( 'labels/members/invitation' ) ),

  agendas = require( 'agendas' ),

  genUrl = require( '../genUrl' ),

  invitations = require( 'invitations' ),

  mailer = require( 'mailer' ),

  users = require( 'users' );

let log = console.log;

module.exports = ( stakeholder, message, context, cb ) => {

  console.log( 'context', context );

  if ( stakeholder.deletedUser ) return cb();

  agendas.get( stakeholder.agendaId, { includeImagePath: true }, ( err, agenda ) => {

    if ( err ) log( 'error', err );

    if ( stakeholder.userId && stakeholder.custom.email ) {

      // Member
      const lang = context.lang || 'fr';

      _sendMessageEmail(
        {
          agenda,
          url: genUrl( 'agendaShow', { slug: agenda.slug } ),
          linkLabel: getMessageLabel( 'emailShowAgenda', lang ),
          message,
          recipient: stakeholder.custom.email,
          replyTo: context.replyTo,
          lang
        },
        cb
      );

    } else if ( stakeholder.userId ) {

      // User without custom.email
      users.get( stakeholder.userId, { detailed: true }, ( err, user ) => {

        if ( err || !user ) return cb();

        const lang = context.lang || 'fr';

        _sendMessageEmail(
          {
            agenda,
            url: genUrl( 'agendaShow', { slug: agenda.slug } ),
            linkLabel: getMessageLabel( 'emailShowAgenda', lang ),
            message,
            recipient: user.email,
            replyTo: context.replyTo,
            lang
          },
          cb
        );

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
    replyTo,
    subject: getMessageLabel( 'newMessage', { agenda: agenda.title }, lang ),
    data: {
      logo: agenda.image ? agenda.image.replace( '.com/', '.com/rwtb' ) : 'https://openagenda.com/images/openagenda.png',
      title: {
        text: getMessageLabel( 'newMessage', { agenda: agenda.title }, lang ),
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