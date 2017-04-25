"use strict";

const _ = require( 'lodash' );
const makeLabelGetter = require( 'labels' );
const credentialLabels = require( 'labels/contributors/credentials' );
const stateLabels = require( 'labels/event/states' );
const credentialTypes = require( 'agenda-stakeholders/iso/credentialTypes' );

const getUid = str => str.split( ':' )[ 1 ];

const eventStateCodeToLabel = code => [
  'tocontrol',
  'controlled',
  'published'
][ code ];

module.exports = ( urls, labels, defaultLang = 'fr' ) => {

  urls = _.merge( {
    'agenda.sendInvitation': {
      agenda: '/agendas/:agenda'
    },
    'agenda.acceptInvitation': {
      agenda: '/agendas/:agenda'
    },
    'agenda.addMember': {
      agenda: '/agendas/:agenda'
    },
    'agenda.setMemberRole': {
      agenda: '/agendas/:agenda'
    },
    'agenda.create': {
      agenda: '/agendas/:agenda'
    },
    'agenda.updateContribution': {
      agenda: '/agendas/:agenda'
    },
    'agenda.updateProfile': {
      agenda: '/agendas/:agenda'
    },
    'agenda.rename': {
      agenda: '/agendas/:agenda'
    },
    'agenda.changeEventState': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    },
    'agenda.publishEvent': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    },
    'agenda.unpublishEvent': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    },
    'agenda.removeEvent': {
      agenda: '/agendas/:agenda'
    },
    'agenda.setOfficial': {
      agenda: '/agendas/:agenda'
    },
    'event.create': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    },
    'event.update': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    }
  }, urls );

  return ( activity, lang = defaultLang ) => {

    const getLabel = makeLabelGetter( labels, lang );
    const getCredentialLabel = makeLabelGetter( credentialLabels, lang );
    const getStateLabel = makeLabelGetter( stateLabels, lang );

    const getEventTitle = labels => {
      const keys = Object.keys( labels );
      return keys.find( v => v === lang ) ? labels[ lang ] : labels[ keys[ 0 ] ];
    }

    const makeUrl = ( entityType, values, label ) => {
      if ( !urls[ activity.verb ] || !urls[ activity.verb ][ entityType ] ) return label;

      const url = Object.keys( values ).reduce( ( prev, next ) => {
        return prev.replace( `:${next}`, values[ next ] );
      }, urls[ activity.verb ][ entityType ] );

      return `<a href="${url}">${label}</a>`;
    };

    let agendaUrl;
    let eventUrl;

    switch ( activity.verb ) {

      case 'agenda.sendInvitation':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );

        return getLabel( 'agenda.sendInvitation', {
          user: activity.store.labels.actor,
          email: activity.object,
          credential: getCredentialLabel( credentialTypes.codes.get( activity.store.credential ) ).toLowerCase(),
          agenda: agendaUrl
        } );

      case 'agenda.acceptInvitation':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );

        return getLabel( 'agenda.acceptInvitation', {
          user: activity.store.labels.actor,
          originMember: activity.store.labels.object,
          credential: getCredentialLabel( credentialTypes.codes.get( activity.store.credential ) ).toLowerCase(),
          agenda: agendaUrl
        } );

      case 'agenda.addMember':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );

        return getLabel( 'agenda.addMember', {
          originMember: activity.store.labels.actor,
          user: activity.store.labels.object,
          credential: getCredentialLabel( credentialTypes.codes.get( activity.store.credential ) ).toLowerCase(),
          agenda: agendaUrl
        } );

      case 'agenda.setMemberRole':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );

        return getLabel( 'agenda.setMemberRole', {
          user: activity.store.labels.actor,
          originMember: activity.store.labels.object,
          credential: getCredentialLabel( credentialTypes.codes.get( activity.store.credential ) ).toLowerCase(),
          beforeCredential: getCredentialLabel( credentialTypes.codes.get( activity.store.beforeCredential ) ).toLowerCase(),
          agenda: agendaUrl
        } );

      case 'agenda.create':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );

        return getLabel( 'agenda.create', {
          user: activity.store.labels.actor,
          agenda: agendaUrl
        } );

      case 'agenda.updateContribution':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );

        return getLabel( 'agenda.updateContribution', {
          user: activity.store.labels.actor,
          agenda: agendaUrl
        } );

      case 'agenda.updateProfile':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );

        return getLabel( 'agenda.updateProfile', {
          user: activity.store.labels.actor,
          agenda: agendaUrl
        } );

      case 'agenda.rename':

        return getLabel( 'agenda.rename', {
          user: activity.store.labels.actor,
          before: makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.beforeTitle ),
          after: makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.afterTitle )
        } );

      case 'agenda.setOfficial':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );

        return getLabel( 'agenda.' + (activity.store.officialized ? 'setOfficial' : 'setUnofficial'), {
          agenda: agendaUrl
        } );

      case 'agenda.changeEventState':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );
        eventUrl = makeUrl( 'event', {
          agenda: getUid( activity.target ),
          event: getUid( activity.object )
        }, getEventTitle( activity.store.labels.object ) );

        return getLabel( 'agenda.changeEventState', {
          agenda: agendaUrl,
          user: activity.store.labels.actor,
          event: eventUrl,
          before: getStateLabel( eventStateCodeToLabel( activity.store.oldState ) ),
          after: getStateLabel( eventStateCodeToLabel( activity.store.newState ) )
        } );

      case 'agenda.publishEvent':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );
        eventUrl = makeUrl( 'event', {
          agenda: getUid( activity.target ),
          event: getUid( activity.object )
        }, getEventTitle( activity.store.labels.object ) );

        return getLabel( 'agenda.publishEvent', {
          agenda: agendaUrl,
          user: activity.store.labels.actor,
          event: eventUrl
        } );

      case 'agenda.unpublishEvent':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );
        eventUrl = makeUrl( 'event', {
          agenda: getUid( activity.target ),
          event: getUid( activity.object )
        }, getEventTitle( activity.store.labels.object ) );

        return getLabel( 'agenda.unpublishEvent', {
          agenda: agendaUrl,
          user: activity.store.labels.actor,
          event: eventUrl
        } );

      case 'agenda.removeEvent':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );

        return getLabel( 'agenda.removeEvent', {
          agenda: agendaUrl,
          user: activity.store.labels.actor,
          event: getEventTitle( activity.store.labels.object )
        } );

      case 'event.create':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );
        eventUrl = makeUrl( 'event', {
          agenda: getUid( activity.target ),
          event: getUid( activity.object )
        }, getEventTitle( activity.store.labels.object ) );

        return getLabel( 'event.create', {
          agenda: agendaUrl,
          user: activity.store.labels.actor,
          event: eventUrl
        } );

      case 'event.update':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );
        eventUrl = makeUrl( 'event', {
          agenda: getUid( activity.target ),
          event: getUid( activity.object )
        }, getEventTitle( activity.store.labels.object ) );

        return getLabel( 'event.update', {
          agenda: agendaUrl,
          user: activity.store.labels.actor,
          event: eventUrl
        } );

      default:

        return 'Activity label missing for verb ' + activity.verb;

    }

  };

}
