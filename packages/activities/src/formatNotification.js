'use strict';

const get = require( 'lodash/get' );
const without = require( 'lodash/without' );
const escape = require( 'lodash/escape' );
const mapValues = require( 'lodash/mapValues' );
const transform = require( 'lodash/transform' );
const mapKeys = require( 'lodash/mapKeys' );

const { getLocaleValue } = require('@openagenda/intl');
const makeLabelGetter = require( '@openagenda/labels/makeLabelGetter' );
const credentialLabels = require( '@openagenda/labels/contributors/credentials' );
const stateLabels = require( '@openagenda/labels/event/states' );
const defaultGetRoleSlug = require('./utils/defaultGetRoleSlug');
const groupBy = require( './service/notifications/lib/groupBy' );


const defaultRenderHighlight = content => `<span class="notif-highlight">${content}</span>`;

const defaultIsAdminMod = role => [2, 3, '2', '3', 'administrator', 'moderator'].includes(role);

const defaultGetUrl = ( notification, { counters }, options = {} ) => {
  const { userUid } = options;

  if (
    [ 'agenda.addMember', 'agenda.removeMember', 'agenda.setMemberRole' ].includes( notification.verb ) &&
    notification.store.objects.includes( `user:${userUid}` )
  ) {
    if (options.isAdminMod(notification.store.credential)) {
      return '/agendas/:target/admin/members';
    }

    return '/agendas/:target';
  }

  switch ( notification.verb ) {
    case 'agenda.sendInvitation':
    case 'agenda.acceptInvitation':
    case 'agenda.addMember':
    case 'agenda.removeMember':
      return '/agendas/:target/admin/members';
    case 'agenda.setMemberRole':
      if ( counters.actor === 1 && counters.object === 1 ) {
        return '/agendas/:target';
      }
      return '/agendas/:target/admin/members';
    case 'agenda.addSource':
    case 'agenda.removeSource':
      return '/agendas/:target/admin/sources';
    case 'agenda.create':
    case 'agenda.rename':
    case 'agenda.setOfficial':
    case 'agenda.setUnofficial':
    case 'agenda.removeEvent':
    case 'event.delete':
      return '/agendas/:target';
    case 'agenda.updateContribution':
      return '/agendas/:target/admin/settings/contribution';
    case 'agenda.updateProfile':
      return '/agendas/:target/admin/settings/profile';
    case 'agenda.changeEventState':
    case 'agenda.publishEvent':
    case 'agenda.unpublishEvent':
    case 'agenda.aggregateEvent':
    case 'agenda.addEvent':
    case 'event.create':
    case 'event.update':
      if ( counters.object === 1 ) {
        return '/agendas/:target/events/:object';
      }
      return '/agendas/:target';
    default:
      return null;
  }
};


const eventStateCodeToLabel = code =>
  [ 'refused', 'tocontrol', 'controlled', 'published' ][ code + 1 ];


module.exports = ( getUrl, labels, options = {} ) => {
  if ( !getUrl ) {
    getUrl = defaultGetUrl;
  }

  const getRoleSlug = options.getRoleSlug || defaultGetRoleSlug;
  const isAdminMod = options.isAdminMod || defaultIsAdminMod;

  const { defaultLang = 'fr', userUid } = options;
  const renderHighlight = options.renderHighlight || defaultRenderHighlight;

  return ( notification, lang = defaultLang ) => {
    const getLabel = makeLabelGetter( labels, lang );
    const getCredentialLabel = makeLabelGetter( credentialLabels, lang );
    const getStateLabel = makeLabelGetter( stateLabels, lang );

    const ignoredSubjects = notification.groupBy.split( '|' ).map( v => v.split( ':' )[ 0 ] );

    const { subjects, counters, firstUids } = [ 'actor', 'object', 'target' ].reduce(
      ( result, columnName ) => {
        if (
          !notification.store[ columnName + 's' ] ||
          !notification.store[ columnName + 's' ].length
        ) {
          return result;
        }

        const [ subjectType, firstUid ] = notification.store[ columnName + 's' ][ 0 ].split( ':' );
        const value = escape( getLocaleValue( notification.store.labels[ columnName ], lang ) );

        result.firstUids[ columnName ] = firstUid;
        result.counters[ columnName ] = notification.store[ columnName + 's' ].length;

        if ( ignoredSubjects.includes( columnName ) ) {
          result.subjects[ columnName ] = value;
        } else {
          result.subjects[ columnName ] = getLabel( subjectType, {
            [ subjectType ]: value,
            others: result.counters[ columnName ] >= 100 ? '99+' : result.counters[ columnName ] - 1
          } );
        }

        return result;
      },
      { subjects: {}, counters: {}, firstUids: {} }
    );

    const additionalSubjects = without(
      groupBy[ notification.verb ],
      'actor',
      'object',
      'target'
    ).reduce( ( result, path ) => {
      result[ path.replace( 'store.', '' ) ] = get( notification, path );
      return result;
    }, {} );

    Object.assign( subjects, additionalSubjects );

    let url = getUrl( notification, { subjects, counters, firstUids }, { ...options, isAdminMod } );

    if ( url ) {
      url = Object.keys( firstUids ).reduce(
        ( prev, key ) => prev.replace( `:${key}`, firstUids[ key ] ),
        url
      );
    }

    if ( subjects.credential ) {
      subjects.credential = getCredentialLabel(
        getRoleSlug( subjects.credential )
      ).toLowerCase();
    }

    if ( notification.verb === 'agenda.changeEventState' ) {
      subjects.newState = getStateLabel(
        eventStateCodeToLabel( subjects.newState )
      );
    }

    if ( notification.verb === 'agenda.addEvent' ) {
      subjects.sourceAgenda = notification.store.labels.sourceAgenda;
    }

    if (
      notification.verb === 'agenda.setOfficial' &&
      !notification.store.officialized
    ) {
      notification.verb = 'agenda.setUnofficial';
    }

    const withYou = (
      [ 'agenda.addMember', 'agenda.removeMember', 'agenda.setMemberRole' ].includes(
        notification.verb
      ) &&
      userUid &&
      notification.store.objects.includes( `user:${userUid}` )
    );

    const labelName = withYou ? `${notification.verb}.withYou` : notification.verb;
    const labelValues = {
      ...mapValues( subjects, renderHighlight ),
      ...mapKeys( counters, ( v, k ) => `${k}Count` ),
      ...transform( counters, ( r, v, k ) => (r[ `${k}More` ] = v - 1) )
    };

    return {
      content: getLabel( labelName, labelValues ),
      url
    };
  };
};

module.exports.defaultGetUrl = defaultGetUrl;
