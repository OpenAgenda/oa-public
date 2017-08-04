"use strict";

if ( !require( 'piping' )( { hook: true } ) ) return;

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../../testconfig.js' );
const service = require( '../../service' );
const agendasSvc = require( 'agendas/service/test' );
const mw = service.mw;
const keysSvc = require( 'keys' );
const keysMw = require( 'keys/middleware' );

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const cookieParser = require( 'cookie-parser' );
const morgan = require( 'morgan' );

const app = require( 'test-app' )( {
  frontWrapper: __dirname + '/../../.tmp/testapp-client.js',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false
} );

const port = process.env.PORT || 3000;

app.use( '/js', express.static( __dirname + '/js' ) );

app.use( ( req, res, next ) => {
  req.user = { id: 2 };
  req.agenda = {
    uid: 17026855,
    slug: 'proces-d-assises-2016'
  }
  next();
} );

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( cookieParser() );

app.use( morgan( ':method :url :status ":user-agent" :response-time ms - :res[content-length]' ) );

app.post( '/', mw.create );
app.get( '/:uid/agenda.json', mw.get );
app.post( '/:slug/edit', mw.set );
app.post( '/:slug/setImage', mw.setImage );
app.post( '/:slug/clearImage', mw.clearImage );
app.post( '/slugs/available', mw.slugs.available );
app.post( '/:slug/remove', [
  mw.removeAgenda,
  ( req, res ) => {
    res.json( { redirectTo: '/' } );
  }
] );

/*******/

app.post( '/:slug/keys/create',
  ( req, res, next ) => {
    req.identifiers = {
      type: 'agendaFullRead',
      identifier: req.agenda.uid
    };
    next();
  },
  keysMw.create(),
  ( req, res, next ) => res.send( req.result )
);

app.get( '/:slug/keys/get',
  ( req, res, next ) => {
    req.identifiers = {
      type: 'agendaFullRead',
      identifier: req.agenda.uid,
      key: req.query.key
    };
    next();
  },
  keysMw.get(),
  ( req, res, next ) => res.send( req.result )
);

app.get( '/:slug/keys/list',
  ( req, res, next ) => {
    req.identifiers = {
      type: 'agendaFullRead',
      identifier: req.agenda.uid
    };
    req.options = { total: true };
    next();
  },
  keysMw.list(),
  ( req, res, next ) => res.send( req.result )
);

app.patch( '/:slug/keys/update',
  ( req, res, next ) => {
    req.identifiers = {
      type: 'agendaFullRead',
      identifier: req.agenda.uid,
      key: req.query.key
    };
    next();
  },
  keysMw.update(),
  ( req, res, next ) => res.send( req.result )
);

app.delete( '/:slug/keys/remove',
  ( req, res, next ) => {
    req.identifiers = {
      type: 'agendaFullRead',
      identifier: req.agenda.uid,
      key: req.query.key
    };
    next();
  },
  keysMw.remove(),
  ( req, res, next ) => res.send( { rowAffected: req.result } )
);

app.use( ( err, req, res, next ) => {

  if ( err.json ) {

    return res.status( err.code || 400 ).send( err.json );

  }

  res.status( 500 ).send();

} );

run().catch( console.error );

async function run() {

  agendasSvc.init( config );

  service.init( Object.assign( config, {
    services: {
      agendas: agendasSvc
    }
  } ) );

  // avoid migrations and do it in fixtures.js
  await keysSvc.init( Object.assign( config, { migrations: null } ) );

  app.get( '*', matchApp );

  app.listen( port, () => {

    console.log( '==> App listening on port', port );

  } );

}

/*******/

function matchApp( req, res, next ) {

  const prefix = '/';
  const lang = req.query.lang || 'fr';

  if ( req.query._app == 'edition' ) {

    mw.matchApp(
      'edit',
      {
        state: {
          settings: { prefix, lang, apiRoot: `http://localhost:${port}` },
          res: {
            get: '/:uid/agenda.json',
            set: '/:slug/edit',
            slugAvailable: '/slugs/available',
            uploadImage: '/:slug/setImage',
            clearImage: '/:slug/clearImage',
            remove: '/:slug/remove',
            keys: {
              create: '/:slug/keys/create',
              list: '/:slug/keys/list',
              update: '/:slug/keys/update',
              remove: '/:slug/keys/remove'
            }
          },
          agenda: {
            uid: 17026855,
            slug: 'proces-d-assises-2016'
          }
        }
      },
      prefix,
      getApp
    )( req, res, next );

  } else { // creation app

    mw.matchApp(
      'create',
      {
        state: {
          settings: { prefix, lang, apiRoot: `http://localhost:${port}` },
          res: {
            create: '',
            slugAvailable: '/slugs/available',
            onCreated: ''
          }
        }
      },
      prefix,
      getApp
    )( req, res, next );

  }

};

function getApp( req, res, next, { store, component } = {} ) {

  const state = store ? store.getState() : {};

  req.data = { state };
  req.content = component ? ReactDOM.renderToString( component ) : '';

  app.renderCanvas( {
    htmlContent: getHtmlBody( req )
  } )( req, res );

}

function getHtmlBody( req ) {

  if ( req.query._app == 'edition' ) {

    return (
      `<div class="container agenda-admin top-margined">
        <div class="row wsq">
          <div class="col col-sm-3 nav">
            <ul class="list-unstyled">
              <li class="menu-item js_menu_item js_menu_item_settings_profile selected">
                <a class="active" href="/profile?_app=edition">
                  <span>Paramètres</span>
                </a>
              </li>
              <li class="menu-item js_menu_item js_menu_item_settings_contribution">
                <a href="/contribution?_app=edition">
                  <span>Contribution</span>
                </a>
              </li>
              <li class="menu-item js_menu_item js_menu_item_settings_advanced">
                <a href="/advanced?_app=edition">
                  <span>Avancé</span>
                </a>
              </li>
            </ul>
          </div>
          <div class="col-sm-9 body">
            <div class="js_canvas">{content}</div>
          </div>
        </div>
      </div>`
    );

  } else { // creation

    return '<div class="js_canvas">{content}</div>';

  }

}
