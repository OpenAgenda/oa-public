"use strict";

const agendaStakeholders = require( '@openagenda/agenda-stakeholders' ),

  users = require( '@openagenda/users' ),

  makeLabelGetter = require( '@openagenda/labels' ),

  activities = require( '@openagenda/activities' ),

  mailer = require( '@openagenda/mailer' ),

  genUrl = require( '../../genUrl' ),

  getInvitationLabel = makeLabelGetter( require( '@openagenda/labels/members/invitation' ) );

let log = console.log;

module.exports = ( invitation, stakeholder, context, agenda ) => {

  if ( !stakeholder.userId ) {

    users.findOne( {
      query: {
        id: context.invitationSender.userId
      }
    } )
      .then( user => {

        return activities.feed( { entityType: 'agenda', entityUid: agenda.uid } ).activities.add( {
          actor: 'user:' + user.uid,
          verb: 'agenda.sendInvitation',
          object: 'email:' + stakeholder.custom.email,
          target: 'agenda:' + agenda.uid,
          store: {
            labels: {
              actor: context.invitationSender.name || user.fullName,
              object: stakeholder.custom.email,
              target: agenda.title
            },
            credential: stakeholder.credential
          }
        } );

      } )
      .catch( err => {

        log( 'error', err );

      } );

  }

  const lang = ( context && context.lang ) || 'fr';

  const signupUrl = stakeholder.userId ?

    genUrl( 'agendaShow', { slug: agenda.slug, lang }, { abs: true, protocol: 'https://' } ) :

    genUrl( 'signup', {
      invitation: invitation.token,
      email: stakeholder.custom.email,
      lang
    }, { abs: true, protocol: 'https://' } );

  const credentialLabel = getInvitationLabel( agendaStakeholders.types.codes.get( stakeholder.credential ), lang );

  const titleLabel = getInvitationLabel(
    stakeholder.userId ? 'emailTitleForExistantUser' : 'emailTitle',
    {
      title: agenda.title,
      credential: credentialLabel
    },
    lang
  );

  mailer( {
    recipient: stakeholder.custom.email,
    subject: getInvitationLabel( 'emailSubject', lang ),
    data: {
      logo: agenda.image || 'https://openagenda.com/images/openagenda.png',
      title: {
        text: titleLabel,
        link: signupUrl
      },
      action: {
        label: getInvitationLabel( stakeholder.userId ? 'emailShowAgenda' : 'emailInscription', lang ),
        link: signupUrl
      },
      description: context.message ? context.message : getInvitationLabel( 'emailDescription', {
        title: agenda.title,
        credential: credentialLabel
      }, lang )
    }
  } );

};

module.exports.setLog = l => log = l;