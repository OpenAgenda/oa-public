"use strict";

const _ = require( 'lodash' );
const makeLabelGetter = require( 'labels' );
const credentialLabels = require( 'labels/contributors/credentials' );
const credentialTypes = require( 'agenda-stakeholders/iso/credentialTypes' );

const getUid = str => str.split( ':' )[ 1 ];

module.exports = ( urls, labels, defaultLang = 'fr' ) => {

  urls = _.merge( {
    'agenda.sentInvitation': {
      agenda: '/agendas/:entity'
    },
    'agenda.acceptInvitation': {
      agenda: '/agendas/:entity'
    },
    'agenda.setMemberRole': {
      agenda: '/agendas/:entity'
    }
  }, urls );

  return ( activity, lang = defaultLang ) => {

    const getLabel = makeLabelGetter( labels, lang );
    const getCredentialLabel = makeLabelGetter( credentialLabels, lang );

    const makeUrl = ( entityType, entity, label ) => {
      if ( !urls[ activity.verb ] || !urls[ activity.verb ][ entityType ] ) return label;
      return `<a href="${urls[ activity.verb ][ entityType ].replace( ':entity', entity )}">${label}</a>`;
    };

    let agendaUrl;

    switch ( activity.verb ) {

      case 'agenda.sentInvitation':

        agendaUrl = makeUrl( 'agenda', getUid( activity.target ), activity.store.labels.target );

        return getLabel( 'agenda.sentInvitation', {
          user: activity.store.labels.actor,
          email: activity.object,
          credential: getCredentialLabel( credentialTypes.codes.get( activity.store.credential ) ).toLowerCase(),
          agenda: agendaUrl
        } );

      case 'agenda.acceptInvitation':

        agendaUrl = makeUrl( 'agenda', getUid( activity.target ), activity.store.labels.target );

        return getLabel( 'agenda.acceptInvitation', {
          user: activity.store.labels.actor,
          originMember: activity.store.labels.object,
          credential: getCredentialLabel( credentialTypes.codes.get( activity.store.credential ) ).toLowerCase(),
          agenda: agendaUrl
        } );

      case 'agenda.setMemberRole':

        agendaUrl = makeUrl( 'agenda', getUid( activity.target ), activity.store.labels.target );

        return getLabel( 'agenda.setMemberRole', {
          user: activity.store.labels.actor,
          originMember: activity.store.labels.object,
          credential: getCredentialLabel( credentialTypes.codes.get( activity.store.credential ) ).toLowerCase(),
          beforeCredential: getCredentialLabel( credentialTypes.codes.get( activity.store.beforeCredential ) ).toLowerCase(),
          agenda: agendaUrl
        } );

      default:

        return 'Activity label missing';

    }

  };

}
