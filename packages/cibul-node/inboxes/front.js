"use strict";

const { promisify } = require( 'util' );
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const morgan = require( 'morgan' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const agendasMw = require( '@openagenda/agendas/middleware' );
const inboxAppsMw = require( '@openagenda/inbox-apps/lib/middleware' );
const makeLabelGetter = require( '@openagenda/labels' );
const labels = require( '@openagenda/labels/inboxes' );
const cmn = require( '../lib/commons-app' );
const { mw: { loadAdminLayout, load: oldAgendaLoad } } = require( '../services/agenda' );
const config = require( '../config' );

const getLabel = makeLabelGetter( labels );

const app = express();

module.exports = ( parentApp, path = '/' ) => parentApp.use( path, app );

const preMw = [
  cmn.loadLogger( 'inboxes/front' ),
  sessions.middleware.ifUnlogged( cmn.redirectToSignin ),
  sessions.middleware.load( { detailed: true } ),
  bodyParser.urlencoded( { extended: true } )
];

if ( __DEVELOPMENT__ ) {
  preMw.push( morgan( 'dev' ) );
}

app.use( '/home/inbox',
  preMw,
  cmn.loadBaseData( 'oasfmain.css' ),
  ( req, res, next ) => {
    inboxAppsMw.matchApp(
      {
        state: {
          settings: {
            prefix: req.baseUrl,
            lang: req.lang,
            apiRoot: `http://localhost:${config.port}`,
            perPageLimit: 20,
            TitleComponent: 'h4'
          },
          res: {
            author: '/home/inbox/author.json',
            conversations: {
              create: '/home/inbox/conversations.json',
              list: '/home/inbox/conversations.json',
              action: '/home/inbox/conversations/:conversationId/action/:code.json'
            },
            messages: {
              list: '/home/inbox/conversations/:conversationId/messages.json',
              create: '/home/inbox/conversations/:conversationId/messages.json'
            }
          }
        }
      },
      req.baseUrl,
      getApp( 'inboxes/user' )
    )( req, res, next );
  }
);

app.use( '/:slug/admin/inbox',
  preMw,
  oldAgendaLoad( 'slug' ),
  cmn.checkAdminOrModerator,
  loadAdminLayout,
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  ( req, res, next ) => {
    inboxAppsMw.matchApp(
      {
        state: {
          settings: {
            prefix: req.baseUrl,
            lang: req.lang,
            apiRoot: `http://localhost:${config.port}`,
            perPageLimit: 20,
            TitleComponent: 'h4'
          },
          res: {
            author: '/agendas/:agendaUid/inbox/author.json',
            conversations: {
              create: '/agendas/:agendaUid/inbox/conversations.json',
              list: '/agendas/:agendaUid/inbox/conversations.json',
              action: '/agendas/:agendaUid/inbox/conversations/:conversationId/action/:code.json'
            },
            messages: {
              list: '/agendas/:agendaUid/inbox/conversations/:conversationId/messages.json',
              create: '/agendas/:agendaUid/inbox/conversations/:conversationId/messages.json'
            }
          },
          agenda: req.agenda
        }
      },
      req.baseUrl,
      getApp( 'agendaAdmin/inbox' )
    )( req, res, next );
  }
);

app.use( '/:slug/contact',
  preMw,
  oldAgendaLoad( 'slug', { name: 'agendaInstance' } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  agendasMw.load( {
    namespaces: { identifiers: { slug: 'params.slug' } },
    private: null
  } ),
  wrap( async ( req, res, next ) => {
    const adminOrModerator = (await Promise.all( [
      promisify( req.agendaInstance.isAdministrator )( { id: req.user.id } ),
      promisify( req.agendaInstance.isModerator )( { id: req.user.id } )
    ] )).some( Boolean );

    if ( adminOrModerator ) {
      console.log( 'IL EST OU LE SETFLASH, IL EST OU !!!' );
      sessions.setFlash( req, res, getLabel( 'youreAdminOrModerator', req.lang ) );
      return res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );
    }

    inboxAppsMw.matchApp(
      {
        state: {
          settings: {
            prefix: req.baseUrl,
            lang: req.lang,
            apiRoot: `http://localhost:${config.port}`,
            perPageLimit: 20,
            TitleComponent: 'h4',
            focusFistConversation: true, // force to display the first conversation if exists
            hideEmptyList: true, // redirect on creation if the list is empty
            allowCreateConversation: true, // hide creation button
            topListConversation: true, // add a conversation form on top of conversation list
            defaultQuery: {
              type: 'contact_form',
              typeIdentifier: req.agenda.uid,
              destinationInbox: {
                type: 'agenda',
                identifier: req.agenda.uid
              }
            }
          },
          res: {
            author: '/home/inbox/author.json',
            conversations: {
              create: '/home/inbox/conversations.json',
              list: '/home/inbox/conversations.json',
              action: '/home/inbox/conversations/:conversationId/action/:code.json'
            },
            messages: {
              list: '/home/inbox/conversations/:conversationId/messages.json',
              create: '/home/inbox/conversations/:conversationId/messages.json'
            }
          },
          agenda: req.agenda
        }
      },
      req.baseUrl,
      ( req, res, next, { store, component } = {} ) => {

        const state = store ? store.getState() : {};
        const lang = req.lang;

        const content = component ? ReactDOM.renderToString( component ) : '';

        const baseData = {
          event: {
            backLink: req.genUrl( 'agendaShow', { slug: req.agenda.slug } )
          },
          image: req.agenda.image,
          title: req.agenda.title
        };

        cmn.render( req, res, 'agenda/contact', { ...baseData, scriptParams: { state }, lang, content } );

      }
    )( req, res, next );
  } )
);

function getApp( template ) {

  return ( req, res, next, { store, component } = {} ) => {

    const state = store ? store.getState() : {};
    const lang = req.lang;

    const content = component ? ReactDOM.renderToString( component ) : '';

    cmn.render( req, res, template, { scriptParams: { state }, lang, content } );

  };

}

/* Util */

function wrap( fn ) {
  return ( req, res, next ) => fn( req, res, next ).catch( next );
}
