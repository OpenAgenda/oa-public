"use strict";

const _ = require( 'lodash' );
const fb = require( '@openagenda/facebook' );
const agendaSvc = require( '@openagenda/agendas' );
const flattenLabels = require( '@openagenda/labels/flatten' );
const labels = require( '@openagenda/labels/agenda-admin/facebook' );
const getLabel = require( '@openagenda/labels/makeLabelGetter' )( labels );
const cmn = require( '../lib/commons-app' );
const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'facebook' }
);

const page = _.template( `
<section>
  <p><%= labels.description %></p>
  <div class="margin-v-md">
    <a class="btn btn-primary" href="/agendas/<%= agenda.uid %>/facebook/tab/link"><%= labels.add %></a>
  </div>
  <div><%= footnote %></div>
</section>` );

module.exports = app => {
  const { sessions, agendas, members } = app.services;

  app.get(
    '/:slug/admin/facebook',
    sessions.mw.loadOrRedirect(),
    cmn.loadAgenda,
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadAndAuthorize('administrator'),
    show
  );

  app.get(
    '/agendas/:uid/facebook/tab/link',
    sessions.mw.loadOrRedirect(),
    cmn.loadAgendaBy( 'uid' ),
    members.mw.loadAndAuthorize('administrator'),
    fb.tab.create
  );

  app.get(
    '/facebook/tab/create/:state',
    sessions.mw.loadOrRedirect(),
    fb.tab.redirect,
    _onComplete
  );

};

function show( req, res ) {

  const flatLabels = flattenLabels( labels, req.lang );

  req.role = req.member.role;

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

  const { sessions } = req.app.services;

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
