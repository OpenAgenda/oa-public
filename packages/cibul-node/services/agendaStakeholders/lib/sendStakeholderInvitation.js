"use strict";

const agendaStakeholders = require( 'agenda-stakeholders' ),

  users = require( 'users' ),

  makeLabelGetter = require( 'labels' ),

  activities = require( 'activities' ),

  mailer = require( 'mailer' ),

  genUrl = require( '../../genUrl' ),

  getInvitationLabel = makeLabelGetter( require( 'labels/members/invitation' ) );

let log = console.log;

module.exports = ( invitation, stakeholder, context, agenda ) => {

  users.get( context.invitationSender.userId, ( err, user ) => {

    if ( err ) return log( 'error', err );

    activities.feed( { entityType: 'agenda', entityUid: agenda.uid } ).activities.add( {
      actor: 'user:' + user.uid,
      verb: 'agenda.sendInvitation',
      object: stakeholder.custom.email,
      target: 'agenda:' + agenda.uid,
      store: {
        labels: {
          actor: context.invitationSender.name || user.full_name,
          // object: stakeholder.custom.email,
          target: agenda.title
        },
        credential: stakeholder.credential
      }
    } );

  } );

  let lang = ( context && context.lang ) || 'fr';

  let signupUrl = genUrl( 'signup', {
    invitation: invitation.token,
    email: stakeholder.custom.email,
    lang
  }, {
    abs: true,
    protocol: 'https://'
  } );

  mailer( {
    recipient: stakeholder.custom.email,
    subject: getInvitationLabel( 'emailSubject', lang ),
    data: {
      logo: agenda.image || 'https://openagenda.com/images/openagenda.png',
      title: {
        text: getInvitationLabel( 'emailTitle', { title: agenda.title }, lang ),
        link: signupUrl
      },
      action: {
        label: getInvitationLabel( 'emailAction', lang ),
        link: signupUrl
      },
      description: context.message ? context.message : getInvitationLabel( 'emailDescription', {
        title: agenda.title,
        credential: getInvitationLabel( agendaStakeholders.types.codes.get( stakeholder.credential ), lang )
      }, lang )
    }
  } );

};

module.exports.setLog = l => log = l;