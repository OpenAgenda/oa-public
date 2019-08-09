"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const agendasSvc = require( '@openagenda/agendas' );
const aggregatorSourcesSvc = require( '@openagenda/aggregator-sources' );
const createApp  = require( '@openagenda/aggregator-sources/dist/client/app' );
const sessions = require( '@openagenda/sessions' );
const aggregatorSvc = require( '../services/aggregator' );
const membersSvc = require( '../services/members' );
const activitiesSvc = require( '../services/activities' );
const cmn = require( '../lib/commons-app' );
const config = require( '../config' );
const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'sources' }
);

const mw = aggregatorSourcesSvc.mw;

const preMw = [
  cmn.loadLogger( 'aggregatorSources' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) )
];


module.exports = app => {

  app.get(
    '/:slug/admin/sources/agenda-sources.json',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
    mw.list
  );

  app.get(
    '/:slug/admin/sources/remove',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
    removeSource
  );

  app.get(
    '/:slug/admin/sources',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
    populateIsAggregator,
    matchApp
  );

  app.get(
    '/:slug/admin/sources/?*?',
    preMw,
    cmn.loadAgenda,
    cmn.authorize.administrator,
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
  const member = await membersSvc.get( {
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

  const { element, triggerHooks, store, context } = createApp( {
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

  try {
    await triggerHooks();

    const content = ReactDOM.renderToString( element );

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if ( context.status === 404 ) {
      return next();
    }

    if ( context.url ) {
      return res.redirect( 301, context.url );
    }

    const { pathname, search } = state.router.location;
    if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
      return res.redirect( 301, pathname );
    }

    return res.send( layout( `<div class="js_canvas">${content}</div>`, {
      lang: req.lang,
      agenda: req.agenda,
      role: req.role,
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
