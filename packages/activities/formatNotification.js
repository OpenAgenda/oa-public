"use strict";

const get = require( 'lodash/get' );
const merge = require( 'lodash/merge' );
const without = require( 'lodash/without' );
const escape = require( 'lodash/escape' );
const reduce = require( 'lodash/reduce' );
const mapValues = require( 'lodash/mapValues' );

const makeLabelGetter = require( '@openagenda/labels' );
const credentialLabels = require( '@openagenda/labels/contributors/credentials' );
const stateLabels = require( '@openagenda/labels/event/states' );
const credentialTypes = require( '@openagenda/agenda-stakeholders/iso/credentialTypes' );

const groupBy = require( './service/notifications/lib/groupBy' );

const eventStateCodeToLabel = code => [
  'tocontrol',
  'controlled',
  'published'
][ code ];

const defaultGetUrl = ( notification, subjects, userUid, labelSuffix ) => {

  if (
    [ 'agenda.addMember', 'agenda.setMemberRole' ].includes( notification.verb )
    && userUid && notification.store.objects.includes( `user:${userUid}` )
  ) {

    if ( credentialTypes.isSuperiorTo( notification.store.credential, credentialTypes.get( 'contributor' ) ) ) {

      return '/agendas/:agenda/admin/members';

    }

    return '/agendas/:agenda';

  }

  const urls = {
    'agenda.sendInvitation': {
      singSing: '/agendas/:agenda/admin/members',
      singPlur: '/agendas/:agenda/admin/members',
      plurSing: '/agendas/:agenda/admin/members',
      plurPlur: '/agendas/:agenda/admin/members'
    },
    'agenda.acceptInvitation': {
      singSing: '/agendas/:agenda/admin/members',
      singPlur: '/agendas/:agenda/admin/members',
      plurSing: '/agendas/:agenda/admin/members',
      plurPlur: '/agendas/:agenda/admin/members'
    },
    'agenda.addMember': {
      singSing: '/agendas/:agenda/admin/members',
      singPlur: '/agendas/:agenda/admin/members',
      plurSing: '/agendas/:agenda/admin/members',
      plurPlur: '/agendas/:agenda/admin/members'
    },
    'agenda.setMemberRole': {
      singSing: '/agendas/:agenda',
      singPlur: '/agendas/:agenda/admin/members',
      plurSing: '/agendas/:agenda/admin/members',
      plurPlur: '/agendas/:agenda/admin/members'
    },
    'agenda.create': {
      sing: '/agendas/:agenda'
    },
    'agenda.updateContribution': {
      sing: '/agendas/:agenda/admin/settings/contribution',
      plur: '/agendas/:agenda/admin/settings/contribution'
    },
    'agenda.updateProfile': {
      sing: '/agendas/:agenda/admin/settings/profile',
      plur: '/agendas/:agenda/admin/settings/profile'
    },
    'agenda.rename': {
      sing: '/agendas/:agenda',
      plur: '/agendas/:agenda'
    },
    'agenda.setOfficial': {
      sing: '/agendas/:agenda'
    },
    'agenda.setUnofficial': {
      sing: '/agendas/:agenda'
    },
    'agenda.changeEventState': {
      singSing: '/agendas/:agenda/events/:event',
      singPlur: '/agendas/:agenda',
      plurSing: '/agendas/:agenda/events/:event',
      plurPlur: '/agendas/:agenda'
    },
    'agenda.publishEvent': {
      singSing: '/agendas/:agenda/events/:event',
      singPlur: '/agendas/:agenda',
      plurSing: '/agendas/:agenda/events/:event',
      plurPlur: '/agendas/:agenda'
    },
    'agenda.unpublishEvent': {
      singSing: '/agendas/:agenda/events/:event',
      singPlur: '/agendas/:agenda',
      plurSing: '/agendas/:agenda/events/:event',
      plurPlur: '/agendas/:agenda'
    },
    'agenda.removeEvent': {
      singSing: '/agendas/:agenda',
      singPlur: '/agendas/:agenda',
      plurSing: '/agendas/:agenda',
      plurPlur: '/agendas/:agenda'
    },
    'event.create': {
      singSing: '/agendas/:agenda/events/:event', // one user, one event
      singPlur: '/agendas/:agenda', // one user, multiple events
      plurPlur: '/agendas/:agenda' // multiple users, multiple events
    },
    'event.update': {
      singSing: '/agendas/:agenda/events/:event', // one user, one event
      singPlur: '/agendas/:agenda', // one user, multiple events
      plurSing: '/agendas/:agenda/events/:event', // multiple users, one event
      plurPlur: '/agendas/:agenda' // multiple users, multiple events
    }
  };

  return urls[ notification.verb ] && urls[ notification.verb ][ lowerFirstLetter( labelSuffix ) ] || null;

};

module.exports = ( getUrl, labels, userUid = null, defaultLang = 'fr' ) => {

  if ( !getUrl ) getUrl = defaultGetUrl;

  return ( notification, lang = defaultLang ) => {

    const getLabel = makeLabelGetter( labels, lang );
    const getCredentialLabel = makeLabelGetter( credentialLabels, lang );
    const getStateLabel = makeLabelGetter( stateLabels, lang );

    const getEventTitle = eventLabels => {
      const keys = Object.keys( eventLabels );
      return keys.find( v => v === lang ) ? eventLabels[ lang ] : eventLabels[ keys[ 0 ] ];
    }

    let labelSuffix = '';
    const firstUids = {};

    const ignoredSubjects = notification.groupBy.split( '|' ).map( v => v.split( ':' )[ 0 ] );
    const subjects = [ 'actor', 'object', 'target' ].reduce( ( result, item ) => {
      if ( !notification.store[ item + 's' ] || !notification.store[ item + 's' ].length ) return result;

      let length = notification.store[ item + 's' ].length;
      let name = notification.store[ item + 's' ][ 0 ].split( ':' )[ 0 ];

      firstUids[ name ] = notification.store[ item + 's' ][ 0 ].split( ':' )[ 1 ];

      let value;
      if ( name === 'event' ) {
        value = escape( getEventTitle( notification.store.labels[ item ] ) );
      } else {
        value = escape( notification.store.labels[ item ] );
      }

      if ( ignoredSubjects.includes( item ) ) {
        result[ item ] = value;
        return result;
      }

      switch ( length ) {
        case 1:
          result[ item ] = getLabel( name + 'Singular', { [ name ]: value } );
          labelSuffix += 'Sing';
          break;
        case 2:
          result[ item ] = getLabel( name + 'OneMore', { [ name ]: value } );
          labelSuffix += 'Plur';
          break;
        default:
          result[ item ] = getLabel( name + 'Plural', { [ name ]: value, nbr: length >= 100 ? '99+' : length - 1 } );
          labelSuffix += 'Plur';
      }

      return result;
    }, {} );

    const additionalSubjects = without( groupBy[ notification.verb ], 'actor', 'object', 'target' )
      .reduce( ( result, path ) => {

        result[ path.replace( 'store.', '' ) ] = get( notification, path );
        return result;

      }, {} );

    Object.assign( subjects, additionalSubjects );

    let url = getUrl( notification, subjects, userUid, lowerFirstLetter( labelSuffix ) ) || null;

    if ( url ) {
      url = Object.keys( firstUids ).reduce( ( prev, next ) => prev.replace( `:${next}`, firstUids[ next ] ), url );
    }

    if ( subjects.credential ) {
      subjects.credential = getCredentialLabel( credentialTypes.codes.get( subjects.credential ) ).toLowerCase();
    }

    if ( notification.verb === 'agenda.changeEventState' ) {
      subjects.newState = getStateLabel( eventStateCodeToLabel( subjects.newState ) );
    }

    if ( notification.verb === 'agenda.setOfficial' && !notification.store.officialized ) {
      notification.verb = 'agenda.setUnofficial';
    }

    let labelName = `${notification.verb}${labelSuffix ? '.' : ''}${lowerFirstLetter( labelSuffix )}`;

    if (
      [ 'agenda.addMember', 'agenda.setMemberRole' ].includes( notification.verb )
      && userUid && notification.store.objects.includes( `user:${userUid}` )
    ) {

      labelName = `${notification.verb}.withYou`;

    }

    return {
      content: getLabel( labelName, mapValues( subjects, v => `<span class="notif-highlight">${v}</span>` ) ),
      url
    };

  };

};

module.exports.defaultGetUrl = defaultGetUrl;

function lowerFirstLetter( string ) {
  return string.charAt( 0 ).toLowerCase() + string.slice( 1 );
}