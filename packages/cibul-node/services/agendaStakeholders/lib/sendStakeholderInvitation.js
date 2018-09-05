"use strict";

const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const users = require( '@openagenda/users' );
const activities = require( '@openagenda/activities' );
const mails = require( '@openagenda/mails' );
const genUrl = require( '../../genUrl' );
const config = require( '../../../config' );

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

  const link = stakeholder.userId
    ? genUrl( 'agendaShow', { slug: agenda.slug, lang }, { abs: true, protocol: 'https://' } )
    : genUrl( 'signup', {
      invitation: invitation.token,
      email: stakeholder.custom.email,
      lang
    }, { abs: true, protocol: 'https://' } );

  const logo = agenda.image
    ? {
      src: agenda.image.replace( '.com/', '.com/rwtb' ),
      width: '100px'
    }
    : {
      src: `${config.root}/images/openagenda.png`,
      width: '300px'
    };

  mails( {
    template: 'stakeholderInvitation',
    to: stakeholder.custom.email,
    data: {
      logo,
      link,
      agenda: agenda.title,
      message: context.message,
      credential: agendaStakeholders.types.codes.get( stakeholder.credential ),
      isStakeholder: !!stakeholder.userId
    },
    lang
  } );

};

module.exports.setLog = l => log = l;
