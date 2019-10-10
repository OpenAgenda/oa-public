"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const { parsePath } = require('history');
const agendasSvc = require( '@openagenda/agendas' );
const aggregatorSourcesSvc = require( '@openagenda/aggregator-sources' );
const createApp  = require( '@openagenda/aggregator-sources/dist/client/app' );
const wrapApp = require( '@openagenda/react-utils/dist/wrapApp' );
const aggregatorSvc = require( '../services/aggregator' );
const activitiesSvc = require( '../services/activities' );
const cmn = require( '../lib/commons-app' );
const config = require( '../config' );
const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'sources' }
);

const sessions = require('../services/sessions');
const members = require('../services/members');

const mw = aggregatorSourcesSvc.mw;

module.exports = app => {
  app.get(
    '/:slug/admin/sources/agenda-sources.json',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    mw.list.bind( null, { send: true } )
  );

  app.get(
    '/agendas/:agendaUid/sources.json',
    cmn.loadAgendaBy( { uid: 'agendaUid' } ),
    mw.list.bind( null, { send: false } ),
    ( req, res, next ) => res.json( {
      total: req.result.total,
      agendas: req.result.reviews
    } )
  );

  app.get(
    '/:slug/admin/sources/remove',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    removeSource
  );

  app.get(
    '/:slug/admin/sources',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    populateIsAggregator,
    matchApp
  );

  app.get(
    '/:slug/admin/sources/?*?',
    sessions.mw.loadOrRedirect,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    populateIsAggregator,
    matchApp
  );
};


function populateIsAggregator( req, res, next ) {

  aggregatorSvc.isAggregator( req.agenda.id, ( err, isAggregator ) => {

    if ( err ) return next( err );

    req.isAggregator = isAggregator;
    next();

  } );

}

function removeSource( req, res, next ) {
  aggregatorSourcesSvc( req.agenda.id ).remove( { uid: req.query.uid } )
    .then( async result => {
      res.send( result );

      let entities = {};

      try {
        const { user, member, agenda, source } = entities = await loadNeedsForActivity( req );

        await addRemoveSourceActivity( { user, member, agenda, source } );
      } catch ( e ) {
        req.log( 'error', 'failed adding activity of type agenda.removeSource', { member: entities.member, exception: e } );
      }
    }, next );
}

async function loadNeedsForActivity( req ) {
  const member = await members.get( {
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  } );

  if ( !member ) {
    throw new Error( 'Cannot found member' );
  }

  const source = await agendasSvc.get( { uid: req.query.uid }, { private: null } );

  if ( !source ) {
    throw new Error( 'Cannot found source agenda' );
  }

  return {
    user: req.user,
    agenda: req.agenda,
    member,
    source
  };
}

function addRemoveSourceActivity( { user, member, agenda, source } ) {
  activitiesSvc.feed( {
    entityType: 'agenda',
    entityUid: agenda.uid
  } ).activities.add( {
    actor: 'user:' + user.uid,
    verb: 'agenda.removeSource',
    object: 'agenda:' + source.uid,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: member.custom.contactName || user.fullName,
        object: source.title,
        target: agenda.title
      }
    }
  } );
}

async function matchApp( req, res, next ) {

  const prefix = `/${req.params.slug}/admin/sources`;
  const lang = req.lang || 'fr';
  const staticContext = {};
  const reactApp = createApp( {
    req,
    initialState: {
      settings: {
        prefix,
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20
      },
      res: {
        list: `/${req.params.slug}/admin/sources/agenda-sources.json`,
        show: req.genUrl( 'agendaShow', { slug: ':slug' } ).split( '?' )[ 0 ],
        remove: `/${req.params.slug}/admin/sources/remove`,
        search: req.genUrl( 'agendaSearch' ).split( '?' )[ 0 ],
        createAggregator: req.genUrl( 'aggregatorCreate', { uid: ':uid' } ).split( '?' )[ 0 ]
      },
      agenda: {
        uid: req.agenda.uid,
        slug: req.agenda.slug,
        title: req.agenda.title,
        isAggregator: req.isAggregator
      }
    }
  } );

  const { triggerHooks, store, history } = reactApp;

  try {
    await triggerHooks();

    const content = ReactDOM.renderToString( wrapApp( reactApp ) );

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if ( staticContext.status === 404 ) {
      return next();
    }

    if ( staticContext.url ) {
      return res.redirect( 302, staticContext.url );
    }

    const { pathname } = history.location;
    if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
      return res.redirect( 302, pathname );
    }

    return res.send( layout( `<div class="js_canvas">${content}</div>`, {
      lang: req.lang,
      agenda: req.agenda,
      role: req.member.role,
      bodyAttributes: [ {
        name: 'data-options',
        value: JSON.stringify( { initialState: state } )
      } ],
      scripts: {
        bottom: [ { src: '/js/aggregatorSourcesIndex.js' } ]
      }
    } ) );

  } catch ( e ) {
    next( e );
  }

}
