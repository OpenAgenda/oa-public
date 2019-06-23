"use strict";

const _ = require( 'lodash' );
const cors = require( 'cors' );
const express = require( 'express' );
const hbs = require( 'hbs' );
const qs = require( 'qs' );

const log = require( './lib/Log' )( 'index' );

const paginate = require( './lib/paginate' );
const Proxy = require( './lib/Proxy' );
const launch = require( './lib/launch' );
const tasks = require( './tasks' );

const mw = {
  index: require( './middleware/renderIndex' ),
  error: require( './middleware/error' ),
  get: require( './middleware/getEvent' ),
  redirectToNeighbor: require( './middleware/eventNavigation' ).redirectToNeighbor,
  list: require( './middleware/listEvents' ),
  pageGlobals: require( './middleware/pageGlobals' ),
  redirectLegacyEventQuery: require( './middleware/redirectLegacyEventQuery' ),
  renderList: require( './middleware/renderList' ),
  redirect: require( './middleware/redirectToEvent' ),
  showPage: require( './middleware/showPage' ),
  navigationLinks: require( './middleware/eventNavigation' ).navigationLinks
}

module.exports = async options => {

  log( 'booting' );

  const app = express();

  const config = _.assign( {
    eventsPerPage: 20
  }, options );

  const {
    eventParser,
    lang, // main language of portal
    uid, // uid of agenda
    key, // public key of OA account
    views, // path to views folder
    assets, // optional path to assets folder
    sass, // optional path to sass file
    eventsPerPage, // optional number of events to load per page
    defaultFilter, // optional: filter that applies when no other filter is set
    cache,
    proxy
  } = config;

  app.set( 'view engine', 'hbs' );
  app.set( 'views', views );
  hbs.registerPartials( views + '/partials' );

  _.assign( app.locals, config );

  app.set( 'proxy', proxy || Proxy( {
    key,
    defaultLimit: eventsPerPage,
    defaultFilter
  } ) );

  // routes

  if ( process.env.NODE_ENV === 'development' ) {
    launch.applyDevelopmentMiddleware( app );
  }

  app.use( express.static( __dirname + '/assets' ) );

  if ( uid ) {
    app.locals.agenda = await proxy.head( uid );
  }

  if ( assets ) {
    app.use( express.static( assets ) );
  }

  app.use( async ( req, res, next ) => {
    res.locals.agendaUid = uid || res.locals.agendaUid || req.params.agendaUid;
    res.locals.agenda = app.locals.agenda || await proxy.head( res.locals.agendaUid );
    next();
  } );

  app.get( '/', mw.redirectLegacyEventQuery, mw.pageGlobals, mw.list, mw.index );
  app.get( '/p/:page', mw.pageGlobals, mw.list, mw.index );

  app.get( '/events/p/:page', mw.list, mw.renderList );
  app.get( '/events', mw.list, mw.renderList );

  app.get( '/events/nav/:direction', mw.redirectToNeighbor );
  app.get( '/events/:slug', mw.pageGlobals, mw.navigationLinks, mw.get );
  app.get( '/permalinks/events/:uid', mw.redirect );

  app.get( '/:page', mw.pageGlobals, mw.showPage );

  app.use( mw.pageGlobals, ( req, res ) => res.status( 404 ).render( '404', req.data ) );

  app.use( mw.error );

  app.launch = launch.bind( null, app );

  tasks( { config, proxy } );

  return app;

}
