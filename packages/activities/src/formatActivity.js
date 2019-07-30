'use strict';

// Polyfill
if ( !('ListFormat' in Intl) ) {
  require( 'intl-list-format' );
}

require( 'intl-list-format/locale-data/en.js' );
require( 'intl-list-format/locale-data/fr.js' );
require( 'intl-list-format/locale-data/de.js' );
require( 'intl-list-format/locale-data/it.js' );
require( 'intl-list-format/locale-data/br.js' );

const merge = require( 'lodash/merge' );
const escape = require( 'lodash/escape' );

const makeLabelGetter = require( '@openagenda/labels/makeLabelGetter' );
const credentialLabels = require( '@openagenda/labels/contributors/credentials' );
const stateLabels = require( '@openagenda/labels/event/states' );
const eventFieldLabels = require( '@openagenda/labels/activities/eventFields' );
const credentialTypes = require( '@openagenda/agenda-stakeholders/dist/iso/credentialTypes' );


const defaultRenderIcon = ( label, type, value ) => (
  `<i 
    class="fa fa-filter"
    aria-hidden="true"
    data-filterlabel="${escape(label)}"
    data-filtertype="${escape(type)}"
    data-filtervalue="${escape(value)}"
  ></i>`
);

const defaultRenderLink = ( label, url ) => `<a href="${url}">${escape( label )}</a>`;

const defaultRenderHighlight = content => `<span class="activity-highlight">${content}</span>`;


const getUid = str => str.split( ':' )[ 1 ];

const eventStateCodeToLabel = code =>
  [ 'refused', 'tocontrol', 'controlled', 'published' ][ code + 1 ];

const getLocaleValue = ( labels, lang ) => {
  if ( typeof labels !== 'object' ) {
    return labels;
  }

  const keys = Object.keys( labels );

  return keys.find( v => v === lang ) ? labels[ lang ] : labels[ keys[ 0 ] ];
};


module.exports = ( urls, labels, defaultLang = 'fr' ) => {
  urls = merge(
    {
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
    },
    urls
  );

  return (
    activity,
    lang = defaultLang,
    options = {}
  ) => {
    const { withFilterIcons } = options;

    const getLabel = makeLabelGetter( labels, lang );
    const getCredentialLabel = code =>
      makeLabelGetter( credentialLabels, lang )( credentialTypes.codes.get( code ) ).toLowerCase();
    const getStateLabel = makeLabelGetter( stateLabels, lang );
    const getFieldLabel = makeLabelGetter( eventFieldLabels, lang );

    const renderIcon = options.renderIcon || defaultRenderIcon;
    const renderLink = options.renderLink || defaultRenderLink;
    const renderHighlight = options.renderHighlight || defaultRenderHighlight;

    const getIcon = ( activity, type ) => (
      withFilterIcons
        ? renderIcon( getLocaleValue( activity.store.labels[ type ] ), type, activity[ type ] )
        : ''
    );

    const makeLink = ( entityType, values, label, filterType ) => {
      if ( !urls[ activity.verb ] || !urls[ activity.verb ][ entityType ] ) {
        return escape( label );
      }

      const url = Object.keys( values ).reduce( ( prev, next ) => {
        return prev.replace( `:${next}`, values[ next ] );
      }, urls[ activity.verb ][ entityType ] );

      const icon = getIcon( getLocaleValue( label ), filterType, `${entityType}:${values[ entityType ]}` );

      return renderHighlight( renderLink( label, url ) + icon );
    };

    switch ( activity.verb ) {
      case 'agenda.sendInvitation': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );

        return getLabel( 'agenda.sendInvitation', {
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          email: renderHighlight( escape( activity.store.labels.object ) + getIcon( activity, 'object' ) ),
          credential: getCredentialLabel( activity.store.credential ),
          agenda: agendaLink
        } );
      }
      case 'agenda.acceptInvitation': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );

        return getLabel( 'agenda.acceptInvitation', {
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          originMember: renderHighlight( escape( activity.store.labels.object ) + getIcon( activity, 'object' ) ),
          credential: getCredentialLabel( activity.store.credential ),
          agenda: agendaLink
        } );
      }
      case 'agenda.addMember': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );

        return getLabel( 'agenda.addMember', {
          originMember: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          user: renderHighlight( escape( activity.store.labels.object ) + getIcon( activity, 'object' ) ),
          credential: getCredentialLabel( activity.store.credential ),
          agenda: agendaLink
        } );
      }
      case 'agenda.setMemberRole': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target
        );

        return getLabel( 'agenda.setMemberRole', {
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          originMember: renderHighlight( escape( activity.store.labels.object ) + getIcon( activity, 'object' ) ),
          credential: getCredentialLabel( activity.store.credential ),
          beforeCredential: getCredentialLabel( activity.store.beforeCredential ),
          agenda: agendaLink
        } );
      }
      case 'agenda.create': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );

        return getLabel( 'agenda.create', {
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          agenda: agendaLink
        } );
      }
      case 'agenda.updateContribution': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );

        return getLabel( 'agenda.updateContribution', {
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          agenda: agendaLink
        } );
      }
      case 'agenda.updateProfile': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );

        return getLabel( 'agenda.updateProfile', {
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          agenda: agendaLink
        } );
      }
      case 'agenda.rename': {
        return getLabel( 'agenda.rename', {
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          before: makeLink(
            'agenda',
            { agenda: getUid( activity.target ) },
            activity.store.labels.beforeTitle
          ),
          after: makeLink(
            'agenda',
            { agenda: getUid( activity.target ) },
            activity.store.labels.afterTitle
          )
        } );
      }
      case 'agenda.setOfficial': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );

        return getLabel(
          activity.store.officialized ? 'agenda.setOfficial' : 'agenda.setUnofficial',
          {
            agenda: agendaLink
          }
        );
      }
      case 'agenda.changeEventState': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );
        const eventLink = makeLink(
          'event',
          {
            agenda: getUid( activity.target ),
            event: getUid( activity.object )
          },
          getLocaleValue( activity.store.labels.object ),
          'object'
        );

        return getLabel( 'agenda.changeEventState', {
          agenda: agendaLink,
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          event: eventLink,
          before: getStateLabel( eventStateCodeToLabel( activity.store.oldState ) ),
          after: getStateLabel( eventStateCodeToLabel( activity.store.newState ) )
        } );
      }
      case 'agenda.publishEvent': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );
        const eventLink = makeLink(
          'event',
          {
            agenda: getUid( activity.target ),
            event: getUid( activity.object )
          },
          getLocaleValue( activity.store.labels.object ),
          'object'
        );

        return getLabel( 'agenda.publishEvent', {
          agenda: agendaLink,
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          event: eventLink
        } );
      }
      case 'agenda.unpublishEvent': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );
        const eventLink = makeLink(
          'event',
          {
            agenda: getUid( activity.target ),
            event: getUid( activity.object )
          },
          getLocaleValue( activity.store.labels.object ),
          'object'
        );

        return getLabel( 'agenda.unpublishEvent', {
          agenda: agendaLink,
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          event: eventLink
        } );
      }
      case 'agenda.removeEvent': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );

        return getLabel( 'agenda.removeEvent', {
          agenda: agendaLink,
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          event: renderHighlight( getLocaleValue( activity.store.labels.object ) + getIcon( activity, 'object' ) )
        } );
      }
      case 'agenda.aggregateEvent': {
        const sourceAgendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.actor ) },
          activity.store.labels.actor,
          'actor'
        );
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );
        const eventLink = makeLink(
          'event',
          {
            agenda: getUid( activity.target ),
            event: getUid( activity.object )
          },
          getLocaleValue( activity.store.labels.object ),
          'object'
        );

        return getLabel( 'agenda.aggregateEvent', {
          agenda: agendaLink,
          event: eventLink,
          sourceAgenda: sourceAgendaLink
        } );
      }
      case 'event.create': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );
        const eventLink = makeLink(
          'event',
          {
            agenda: getUid( activity.target ),
            event: getUid( activity.object )
          },
          getLocaleValue( activity.store.labels.object ),
          'object'
        );

        return getLabel( 'event.create', {
          agenda: agendaLink,
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          event: eventLink
        } );
      }
      case 'event.update': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );
        const eventLink = makeLink(
          'event',
          {
            agenda: getUid( activity.target ),
            event: getUid( activity.object )
          },
          getLocaleValue( activity.store.labels.object ),
          'object'
        );

        const { diff } = activity.store;

        if ( !diff ) {
          return getLabel( 'event.update', {
            agenda: agendaLink,
            user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
            event: eventLink
          } );
        }

        const diffFields = diff
          .map( v => v.path[ 0 ] )
          .filter( ( v, i, a ) => ![ 'createdAt', 'updatedAt' ].includes( v ) && a.indexOf( v ) === i );
        const escapedFields = diffFields.map( v => escape( getFieldLabel( v ) ) ).filter( Boolean );
        const translatedFields = new Intl.ListFormat( lang, {
          localeMatcher: 'best fit',
          style: 'long',
          type: 'conjunction'
        } )
          .formatToParts( escapedFields )
          .map( v => v.type === 'element' ? renderHighlight( v.value ) : v.value )
          .join( '' );

        const data = {
          agenda: agendaLink,
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          event: eventLink,
          fields: translatedFields,
          fieldsCount: renderHighlight( diffFields.length )
        };

        if ( diffFields.length === 1 ) {
          // With one change
          return getLabel( 'event.updateWithOneChange', data );
        } else if ( diffFields.length < 3 ) {
          // With some changes
          return getLabel( 'event.updateWithSomeChanges', data );
        } else {
          // With a lot of changes
          return getLabel( 'event.updateWithLotOfChanges', data );
        }
      }
      case 'event.delete': {
        const agendaLink = makeLink(
          'agenda',
          { agenda: getUid( activity.target ) },
          activity.store.labels.target,
          'target'
        );

        return getLabel( 'event.delete', {
          agenda: agendaLink,
          user: renderHighlight( escape( activity.store.labels.actor ) + getIcon( activity, 'actor' ) ),
          event: renderHighlight( getLocaleValue( activity.store.labels.object ) + getIcon( activity, 'object' ) )
        } );
      }
      default: {
        return getLabel( 'unknownActivity', { verb: activity.verb } );
      }
    }
  };
};
