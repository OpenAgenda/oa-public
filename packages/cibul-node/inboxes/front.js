"use strict";

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const morgan = require( 'morgan' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const agendasMw = require( '@openagenda/agendas/middleware' );
const inboxAppsMw = require( '@openagenda/inbox-apps/lib/middleware' );
const cmn = require( '../lib/commons-app' );
const { mw: { loadAdminLayout, load: oldAgendaLoad } } = require( '../services/agenda' );
const config = require( '../config' );

const app = express();

module.exports = ( parentApp, path = '/' ) => parentApp.use( path, app );

const preMw = [
  cmn.loadLogger( 'inboxes/front' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.status( 400 ).json( { error: 'Not logged' } ) ),
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
            perPageLimit: 20
          },
          res: {
            conversations: {
              list: '/home/inbox/conversations',
              action: '/home/inbox/conversations/:conversationId/action/:code'
            },
            messages: {
              list: '/home/inbox/conversations/:conversationId/messages',
              create: '/home/inbox/conversations/:conversationId/messages'
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
            perPageLimit: 20
          },
          res: {
            author: '/agendas/:agendaUid/inbox/author.json',
            conversations: {
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

function getApp( template ) {

  return ( req, res, next, { store, component } = {} ) => {

    const state = store ? store.getState() : {};
    const lang = req.lang;

    const content = component ? ReactDOM.renderToString( component ) : '';

    cmn.render( req, res, template, { scriptParams: { state }, lang, content } );

  };

}
