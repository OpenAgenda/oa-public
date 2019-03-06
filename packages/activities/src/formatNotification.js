"use strict";

const get = require( 'lodash/get' );
const without = require( 'lodash/without' );
const escape = require( 'lodash/escape' );
const mapValues = require( 'lodash/mapValues' );

const makeLabelGetter = require( '@openagenda/labels/makeLabelGetter' );
const credentialLabels = require( '@openagenda/labels/contributors/credentials' );
const stateLabels = require( '@openagenda/labels/event/states' );
const credentialTypes = require( '@openagenda/agenda-stakeholders/dist/iso/credentialTypes' );

const groupBy = require( './service/notifications/lib/groupBy' );

const eventStateCodeToLabel = code => [
  'refused',
  'tocontrol',
  'controlled',
  'published'
][ code + 1 ];

const defaultGetUrl = ( notification, subjects, userUid, labelSuffix ) => {

  if (
    [ 'agenda.addMember', 'agenda.setMemberRole' ].includes( notification.verb )
    && userUid && notification.store.objects.includes( `user:${userUid}` )
  ) {

    if ( credentialTypes.isSuperiorTo( notification.store.credential, credentialTypes.get( 'contributor' ) ) ) {

      return '/agendas/:target/admin/members';

    }

    return '/agendas/:target';

  }

  const urls = {
    'agenda.sendInvitation': {
      singSing: '/agendas/:target/admin/members',
      singPlur: '/agendas/:target/admin/members',
      plurSing: '/agendas/:target/admin/members',
      plurPlur: '/agendas/:target/admin/members'
    },
    'agenda.acceptInvitation': {
      singSing: '/agendas/:target/admin/members',
      singPlur: '/agendas/:target/admin/members',
      plurSing: '/agendas/:target/admin/members',
      plurPlur: '/agendas/:target/admin/members'
    },
    'agenda.addMember': {
      singSing: '/agendas/:target/admin/members',
      singPlur: '/agendas/:target/admin/members',
      plurSing: '/agendas/:target/admin/members',
      plurPlur: '/agendas/:target/admin/members'
    },
    'agenda.setMemberRole': {
      singSing: '/agendas/:target',
      singPlur: '/agendas/:target/admin/members',
      plurSing: '/agendas/:target/admin/members',
      plurPlur: '/agendas/:target/admin/members'
    },
    'agenda.create': {
      sing: '/agendas/:target'
    },
    'agenda.updateContribution': {
      sing: '/agendas/:target/admin/settings/contribution',
      plur: '/agendas/:target/admin/settings/contribution'
    },
    'agenda.updateProfile': {
      sing: '/agendas/:target/admin/settings/profile',
      plur: '/agendas/:target/admin/settings/profile'
    },
    'agenda.rename': {
      sing: '/agendas/:target',
      plur: '/agendas/:target'
    },
    'agenda.setOfficial': {
      sing: '/agendas/:target'
    },
    'agenda.setUnofficial': {
      sing: '/agendas/:target'
    },
    'agenda.changeEventState': {
      singSing: '/agendas/:target/events/:object',
      singPlur: '/agendas/:target',
      plurSing: '/agendas/:target/events/:object',
      plurPlur: '/agendas/:target'
    },
    'agenda.publishEvent': {
      singSing: '/agendas/:target/events/:object',
      singPlur: '/agendas/:target',
      plurSing: '/agendas/:target/events/:object',
      plurPlur: '/agendas/:target'
    },
    'agenda.unpublishEvent': {
      singSing: '/agendas/:target/events/:object',
      singPlur: '/agendas/:target',
      plurSing: '/agendas/:target/events/:object',
      plurPlur: '/agendas/:target'
    },
    'agenda.removeEvent': {
      singSing: '/agendas/:target',
      singPlur: '/agendas/:target',
      plurSing: '/agendas/:target',
      plurPlur: '/agendas/:target'
    },
    'agenda.aggregateEvent': {
      sing: '/agendas/:target/events/:object', // one source, one event
      plur: '/agendas/:target', // one source, multiple events
    },
    'event.create': {
      singSing: '/agendas/:target/events/:object', // one user, one event
      singPlur: '/agendas/:target', // one user, multiple events
      plurPlur: '/agendas/:target' // multiple users, multiple events
    },
    'event.update': {
      singSing: '/agendas/:target/events/:object', // one user, one event
      singPlur: '/agendas/:target', // one user, multiple events
      plurSing: '/agendas/:target/events/:object', // multiple users, one event
      plurPlur: '/agendas/:target' // multiple users, multiple events
    },
    'event.delete': {
      sing: '/agendas/:target',
      plur: '/agendas/:target'
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

    const subjects = [ 'actor', 'object', 'target' ].reduce( ( result, columnName ) => {
      if ( !notification.store[ columnName + 's' ] || !notification.store[ columnName + 's' ].length ) {
        return result;
      }

      const subjectType = notification.store[ columnName + 's' ][ 0 ].split( ':' )[ 0 ];
      firstUids[ columnName ] = notification.store[ columnName + 's' ][ 0 ].split( ':' )[ 1 ];

      const value = subjectType === 'event'
        ? escape( getEventTitle( notification.store.labels[ columnName ] ) )
        : escape( notification.store.labels[ columnName ] );

      if ( ignoredSubjects.includes( columnName ) ) {
        result[ columnName ] = value;
        return result;
      }

      const numberOfSubjects = notification.store[ columnName + 's' ].length;

      switch ( numberOfSubjects ) {
        case 1:
          result[ columnName ] = getLabel( subjectType + 'Singular', { [ subjectType ]: value } );
          labelSuffix += 'Sing';
          break;
        case 2:
          result[ columnName ] = getLabel( subjectType + 'OneMore', { [ subjectType ]: value } );
          labelSuffix += 'Plur';
          break;
        default:
          result[ columnName ] = getLabel(
            subjectType + 'Plural',
            { [ subjectType ]: value, nbr: numberOfSubjects >= 100 ? '99+' : numberOfSubjects - 1 }
          );
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
