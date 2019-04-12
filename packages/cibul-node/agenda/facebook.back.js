"use strict";

const _ = require( 'lodash' );

const fb = require( '@openagenda/facebook' );
const sessions = require( '@openagenda/sessions' );

const agendaSvc = require( '@openagenda/agendas' );
const modLib = require( '../lib/moduleLib' );

const cmn = require( '../lib/commons-app' );

const flattenLabels = require( '@openagenda/labels/flatten' );
const labels = require( '@openagenda/labels/agenda-admin/facebook' );
const getLabel = require( '@openagenda/labels/makeLabelGetter' )( labels );

const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'facebook' }
);

const page = _.template( `<div class="margin-bottom-lg"><h2><%= labels.title %></h2></div>
<section>
  <p><%= labels.description %></p>
  <div class="margin-v-md">
    <a class="btn btn-primary" href="/agendas/<%= agenda.uid %>/facebook/tab/link"><%= labels.add %></a>
  </div>
  <div><%= footnote %></div>
</section>` );

const routes = {

  facebookShow: [ 'get', '/:slug/admin/facebook', [
    cmn.loadAgenda,
    cmn.authorize.administrator,
    show
  ] ],

  facebookTabLink: [ 'get', '/agendas/:uid/facebook/tab/link', [
    cmn.loadAgendaBy( 'uid' ),
    cmn.authorize.administrator,
    fb.tab.create
  ] ],

  facebookTabRedirect: [ 'get', '/facebook/tab/create/:state', [
    fb.tab.redirect,
    _onComplete
  ] ]

};

module.exports = path => {

  const router = modLib.Router( routes );

  router.pre( [
    sessions.middleware.ifUnlogged( cmn.redirectTo( 'agendaSignup', { slug: 'slug' } ) )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function show( req, res ) {

  const flatLabels = flattenLabels( labels, req.lang );

  res.send( layout( page( {
    agenda: req.agenda,
    labels: flatLabels,
    footnote: flatLabels.footnote.replace(
      '%link%',[
        '<a target="_blank" href="https://developers.facebook.com/docs/graph-api/changelog/version2.11/#gapi-90-pages">',
        flatLabels.conditions,
        '</a>'
      ].join( '' )
    )
  } ), req ) );

}


function _onComplete( req, res, next ) {

  agendaSvc.get( {
    id: req.agendaId
  }, {
    private: null,
    internal: true,
    includeImagePath: true
  }, ( err, agenda ) => {

    if ( err ) return next( req.query.error_msg ? req.query.error_msg : err );

    sessions.setFlash( req, res, getLabel( 'facebookTabAdded', req.lang ) );

    res.redirect( `/${agenda.slug}/admin/facebook` );

  } );

}
