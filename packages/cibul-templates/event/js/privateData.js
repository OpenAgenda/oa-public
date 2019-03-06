import React from 'react';
import _ from 'lodash';
import debug from 'debug';
import du from '@openagenda/dom-utils';
import loadInbox from '@openagenda/inbox-apps/dist/apps/lazyInbox/load';
import sessions from '@openagenda/sessions/client';
import activities from './activities';
import displayContributor from './contributor';
import remote from '../../js/lib/remote/remote.mod.js';
import makeLabelGetter from '@openagenda/labels';
import inboxesLabels from '@openagenda/labels/inboxes';

const getInboxesLabel = makeLabelGetter( inboxesLabels );

const defaults = {
  uid: false,
  agendaUid: false,
  env: 'production',
  selector: '.js_custom',
  url: {
    production: '/agendas/{agendaUid}/events/{eventUid}/private',
    development: '/agendas/{agendaUid}/events/{eventUid}/private',
    tpl: '/server/testdata/privateeventdata.json'
  },
  activitiesSelector: '.js_activities',
  contributorsSelector: '.js_contributor',
  activitiesUrl: {
    production: '/agendas/{agendaUid}/events/{eventUid}/activities',
    development: '/agendas/{agendaUid}/events/{eventUid}/activities',
    tpl: '/server/testdata/eventactivitiesdata.json'
  },
  customTemplate: require( '../custom.part.ejs' ),
  className: 'private'
};

let log;


module.exports = function ( options ) {

  var params = _.extend( {
    roles: []
  }, defaults, options ? options : {} );

  if ( window.env ) params.env = window.env;

  if ( [ 'development', 'tpl' ].indexOf( params.env ) !== -1 ) {

    debug.enable( '*' );

  }

  log = debug( 'customData' );

  return {
    load: load,
    activities: displayActivities,
    inbox
  }

  function load( agendaUid, eventUid, lang ) {

    var res = _defineRes( agendaUid, eventUid, lang );

    _fetch( res, function ( err, data ) {

      if ( err ) {

        log( 'error', err );

        return;

      }

      if ( _.keys( data.custom.custom ).length ) {

        du.el( params.selector ).insertAdjacentHTML( 'beforeend', _renderCustom( data.custom ) );

      }

      if ( data.contributor && _.keys( data.contributor ).length ) {

        displayContributor( {
          contributor: data.contributor,
          canvas: du.el( params.contributorsSelector )
        } );

      }

      const tagGroups = _.get( data, 'tagGroups', [] ).filter( g => g.access !== 'public' );

      displayPrivateTags( tagGroups );

    } );

  }

  function displayActivities( agendaUid, eventUid, lang ) {

    activities( {
      canvas: du.el( params.activitiesSelector ),
      res: params.activitiesUrl[ params.env ].replace( '{agendaUid}', agendaUid ).replace( '{eventUid}', eventUid ),
      fetch: _fetch,
      lang
    } );

  }

  function displayPrivateTags( tagGroups ) {

    tagGroups.forEach( g => {

      du.el( '.js_tag_groups' ).insertAdjacentHTML( 'beforeend', `<div class="tags">
        <label><i class="fa fa-unlock-alt margin-right-xs"></i><span>${g.name}</span></label>:
        <ul>
          ${g.tags.map( t => '<li>' + t.label + '</li>' )}
        </ul>
      </div>` );

    } );

  }

  function inbox( params, { roles, ROLES } ) {

    if ( !document.querySelector( '.js_inbox_event_canvas' ) ) {
      return;
    }

    const simpleUser = !roles.some( r => r == ROLES.AGENDAMODERATOR || r == ROLES.AGENDAADMIN );
    const resBasePath = simpleUser ? '/home' : '/agendas/:agendaUid';

    const user = sessions.getUser();

    // userRole === 'adminContributor' || 'adminmod' || 'contributor' || 'simpleUser'
    const userRole = (() => {
      if ( simpleUser && user.uid === params.ownerUid ) {
        return 'contributor';
      }
      if ( user.uid === params.ownerUid ) {
        return 'adminContributor'
      }
      return simpleUser ? 'simpleUser' : 'adminmod';
    })();

    // eventConvDescAdminmod
    // eventConvDescContributor
    // eventConvDescSimpleUser
    const creationDescriptionLabel = getInboxesLabel( 'eventConvDesc' + _.upperFirst( userRole ), params.lang );

    const destinationInbox = (() => {
      switch ( userRole ) {
        case 'adminContributor': // admin contributor
          return;
        case 'adminmod': // admin (not contributor) -> contributor
          return {
            type: 'user',
            identifier: params.ownerUid
          };
        case 'contributor': // contributor (not admin) -> admins/modos
          return {
            type: 'agenda',
            identifier: params.agendaUid
          };
        case 'simpleUser': // user lambda -> admins/modos + contributor
          return [ {
            type: 'agenda',
            identifier: params.agendaUid
          }, {
            type: 'user',
            identifier: params.ownerUid
          } ];
      }
    })();

    loadInbox( {
      jsFilePath: '/js/inboxesEvent.js',
      functionName: 'renderInboxEvent',
      initialState: {
        user,
        settings: {
          context: 'event',
          prefix: '',
          focusFistConversation: [ 'contributor', 'simpleUser' ].includes( userRole ), // force to display the first conversation if exists
          hideEmptyList: true, // redirect on creation if the list is empty
          allowCreateConversation: true, // display (or not) creation button
          allClosedForCreate: [ 'contributor', 'simpleUser' ].includes( userRole ),
          maskEventTitle: true, // useless on event page
          // maskCreationSubtitle: true, // useless on event page
          creationSubtitle: getInboxesLabel(
            userRole === 'adminmod' ? 'contactContributor' : 'contactAdministrators',
            params.lang
          ),
          creationButtonLabel: getInboxesLabel(
            userRole === 'adminmod' ? 'contactContributor' : 'contactAdministrators',
            params.lang
          ),
          creationDescriptionLabel,
          defaultQuery: {
            type: 'event',
            typeIdentifier: params.uid,
            destinationInbox,
            params: {
              agendaTitle: _.unescape( params.agendaTitle ),
              eventTitle: _.unescape( params.title ),
              agendaUid: params.agendaUid
            }
          },
          ContentWrapper: ( { children } ) => <div className="event-content padding-h-sm padding-v-md">{children}</div>,
          lang: params.lang,
        },
        res: {
          author: resBasePath + '/inbox/author.json',
          conversations: {
            list: resBasePath + '/inbox/conversations.json',
            create: resBasePath + '/inbox/conversations.json',
            action: resBasePath + '/inbox/conversations/:conversationId/action/:code.json',
            resume: resBasePath + '/inbox/conversations/:conversationId/resume.json'
          },
          messages: {
            list: resBasePath + '/inbox/conversations/:conversationId/messages.json',
            create: resBasePath + '/inbox/conversations/:conversationId/messages.json',
            prepareAttachment: resBasePath + '/inbox/conversations/:conversationId/prepare-attachment',
            addAttachment: resBasePath + '/inbox/conversations/:conversationId/add-attachment'
          }
        },
        agenda: {
          uid: params.agendaUid
        },
        event: {
          uid: params.uid
        }
      },
    }, () => {

      const canvasElem = document.querySelector( '.js_inbox_event_canvas' );

      canvasElem.classList.remove( 'display-none' );

    } );

  }

  function _fetch( res, cb ) {

    log( 'fetching %s', res );

    remote.get( res, { timeout: 30000 }, function ( responseType, data ) {

      if ( responseType == 'success' ) {

        cb( null, data );

      } else {

        cb( data.responseType );

      }

    }, true );

  }

  function _defineRes( agendaUid, eventUid, lang ) {

    var res = params.url[ params.env ];

    res = res.replace( '{eventUid}', eventUid )
      .replace( '{agendaUid}', agendaUid );

    if ( lang ) res += '?lang=' + lang;

    return res;

  }

  function _renderContributor( data ) {

    return params.contributorHead + params.contributorTemplate( data );

  }

  function _renderCustom( data ) {

    return params.customTemplate( _.extend( {
      private: '<div class="private-label"><i class="fa fa-unlock-alt"></i> <span>Information privée</span></div>',
      _i: ( image, staticFile ) => {

        if ( staticFile ) return '//cibulstatic.s3.amazonaws.com/' + image;

        return '//cibul.s3.amazonaws.com/' + image;

      }
    }, data ) );

  }

}
