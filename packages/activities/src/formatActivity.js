"use strict";

const merge = require( 'lodash/merge' );
const escape = require( 'lodash/escape' );

const makeLabelGetter = require( '@openagenda/labels/makeLabelGetter' );
const credentialLabels = require( '@openagenda/labels/contributors/credentials' );
const stateLabels = require( '@openagenda/labels/event/states' );
const credentialTypes = require( '@openagenda/agenda-stakeholders/dist/iso/credentialTypes' );

const getUid = str => str.split( ':' )[ 1 ];

const eventStateCodeToLabel = code => [
  'refused',
  'tocontrol',
  'tobecontrolled',
  'controlled',
  'published'
][ code ];

module.exports = ( urls, labels, defaultLang = 'fr' ) => {

  urls = merge( {
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
    'agenda.aggregateEvent': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    },
    'event.create': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    },
    'event.update': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    },
    'event.delete': {
      agenda: '/agendas/:agenda'
    }
  }, urls );

  return ( activity, lang = defaultLang, withFilterIcons = false ) => {

    const getLabel = makeLabelGetter( labels, lang );
    const getCredentialLabel = makeLabelGetter( credentialLabels, lang );
    const getStateLabel = makeLabelGetter( stateLabels, lang );

    const getEventTitle = labels => {
      if ( typeof labels !== 'object' ) return labels;

      const keys = Object.keys( labels );
      return keys.find( v => v === lang ) ? labels[ lang ] : labels[ keys[ 0 ] ];
    }

    const getIcon = ( activity, type ) => {
      if ( !withFilterIcons ) return '';
      return `<i class="fa fa-filter" aria-hidden="true" data-filterlabel="${escape( getEventTitle( activity.store.labels[ type ] ) )}" data-filtertype="${type}" data-filtervalue="${activity[ type ]}"></i>`;
    };

    const makeUrl = ( entityType, values, label, filterType ) => {
      if ( !urls[ activity.verb ] || !urls[ activity.verb ][ entityType ] ) return escape( label );

      const url = Object.keys( values ).reduce( ( prev, next ) => {
        return prev.replace( `:${next}`, values[ next ] );
      }, urls[ activity.verb ][ entityType ] );

      const icon = `<i class="fa fa-filter" aria-hidden="true" data-filterlabel="${escape( getEventTitle( label ) )}" data-filtertype="${escape( filterType )}" data-filtervalue="${entityType}:${values[ entityType ]}"></i>`;

      return `<span class="activity-highlight"><a href="${url}">${escape( label )}</a>${withFilterIcons ? icon : ''}</span>`;
    };

    let agendaUrl;
    let eventUrl;

    switch ( activity.verb ) {

      case 'agenda.sendInvitation':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );

        return getLabel( 'agenda.sendInvitation', {
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          email: '<span class="activity-highlight">' + escape( activity.store.labels.object ) + getIcon( activity, 'object' ) + '</span>',
          credential: getCredentialLabel( credentialTypes.codes.get( activity.store.credential ) ).toLowerCase(),
          agenda: agendaUrl
        } );

      case 'agenda.acceptInvitation':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );

        return getLabel( 'agenda.acceptInvitation', {
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          originMember: '<span class="activity-highlight">' + escape( activity.store.labels.object ) + getIcon( activity, 'object' ) + '</span>',
          credential: getCredentialLabel( credentialTypes.codes.get( activity.store.credential ) ).toLowerCase(),
          agenda: agendaUrl
        } );

      case 'agenda.addMember':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );

        return getLabel( 'agenda.addMember', {
          originMember: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          user: '<span class="activity-highlight">' + escape( activity.store.labels.object ) + getIcon( activity, 'object' ) + '</span>',
          credential: getCredentialLabel( credentialTypes.codes.get( activity.store.credential ) ).toLowerCase(),
          agenda: agendaUrl
        } );

      case 'agenda.setMemberRole':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target );

        return getLabel( 'agenda.setMemberRole', {
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          originMember: '<span class="activity-highlight">' + escape( activity.store.labels.object ) + getIcon( activity, 'object' ) + '</span>',
          credential: getCredentialLabel( credentialTypes.codes.get( activity.store.credential ) ).toLowerCase(),
          beforeCredential: getCredentialLabel( credentialTypes.codes.get( activity.store.beforeCredential ) ).toLowerCase(),
          agenda: agendaUrl
        } );

      case 'agenda.create':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );

        return getLabel( 'agenda.create', {
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          agenda: agendaUrl
        } );

      case 'agenda.updateContribution':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );

        return getLabel( 'agenda.updateContribution', {
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          agenda: agendaUrl
        } );

      case 'agenda.updateProfile':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );

        return getLabel( 'agenda.updateProfile', {
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          agenda: agendaUrl
        } );

      case 'agenda.rename':

        return getLabel( 'agenda.rename', {
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          before: makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.beforeTitle ),
          after: makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.afterTitle )
        } );

      case 'agenda.setOfficial':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );

        return getLabel( 'agenda.' + (activity.store.officialized ? 'setOfficial' : 'setUnofficial'), {
          agenda: agendaUrl
        } );

      case 'agenda.changeEventState':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );
        eventUrl = makeUrl( 'event', {
          agenda: getUid( activity.target ),
          event: getUid( activity.object )
        }, getEventTitle( activity.store.labels.object ), 'object' );

        return getLabel( 'agenda.changeEventState', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          event: eventUrl,
          before: getStateLabel( eventStateCodeToLabel( activity.store.oldState ) ),
          after: getStateLabel( eventStateCodeToLabel( activity.store.newState ) )
        } );

      case 'agenda.publishEvent':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );
        eventUrl = makeUrl( 'event', {
          agenda: getUid( activity.target ),
          event: getUid( activity.object )
        }, getEventTitle( activity.store.labels.object ), 'object' );

        return getLabel( 'agenda.publishEvent', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          event: eventUrl
        } );

      case 'agenda.unpublishEvent':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );
        eventUrl = makeUrl( 'event', {
          agenda: getUid( activity.target ),
          event: getUid( activity.object )
        }, getEventTitle( activity.store.labels.object ), 'object' );

        return getLabel( 'agenda.unpublishEvent', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          event: eventUrl
        } );

      case 'agenda.removeEvent':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );

        return getLabel( 'agenda.removeEvent', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          event: '<span class="activity-highlight">' + getEventTitle( activity.store.labels.object ) + getIcon( activity, 'object' ) + '</span>'
        } );

      case 'agenda.aggregateEvent':

        const sourceAgendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.actor ) }, activity.store.labels.actor, 'actor' );
        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );
        eventUrl = makeUrl( 'event', {
          agenda: getUid( activity.target ),
          event: getUid( activity.object )
        }, getEventTitle( activity.store.labels.object ), 'object' );

        return getLabel( 'agenda.aggregateEvent', {
          agenda: agendaUrl,
          event: eventUrl,
          sourceAgenda: sourceAgendaUrl
        } );

      case 'event.create':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );
        eventUrl = makeUrl( 'event', {
          agenda: getUid( activity.target ),
          event: getUid( activity.object )
        }, getEventTitle( activity.store.labels.object ), 'object' );

        return getLabel( 'event.create', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          event: eventUrl
        } );

      case 'event.update':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );
        eventUrl = makeUrl( 'event', {
          agenda: getUid( activity.target ),
          event: getUid( activity.object )
        }, getEventTitle( activity.store.labels.object ), 'object' );

        return getLabel( 'event.update', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          event: eventUrl
        } );

      case 'event.delete':

        agendaUrl = makeUrl( 'agenda', { agenda: getUid( activity.target ) }, activity.store.labels.target, 'target' );

        return getLabel( 'event.delete', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) + '</span>',
          event: '<span class="activity-highlight">' + getEventTitle( activity.store.labels.object ) + getIcon( activity, 'object' ) + '</span>'
        } );

      default:

        return 'Activity label missing for verb ' + activity.verb;

    }

  };

}
