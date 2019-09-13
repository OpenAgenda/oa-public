"use strict";

const tagMw = require( '@openagenda/agenda-tags' ).mw( 'agenda.id', 'tagSet' );
const categoryMw = require( '@openagenda/agenda-categories' ).mw( 'agenda.id', 'categorySet' );
const cmn = require( '../lib/commons-app' );
const controlData = require( '../services/legacy' ).controlData;

const sessions = require( '../services/sessions' );
const members = require('../services/members');
const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'customized' }
);

module.exports = app => {

  app.get(
    '/:slug/admin/settings/customize',
    sessions.mw.loadOrRedirect,
    cmn.verifyIPMiddleware,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    cmn.checkCredential( 'tags', { namespace: 'hasTagsCred' } ),
    tagMw.get,
    categoryMw.get,
    show
  );

  app.post(
    '/:slug/admin/settings/customize',
    sessions.mw.loadOrRedirect,
    cmn.verifyIPMiddleware,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator'),
    tagMw.set,
    categoryMw.set,
    _updateControlData,
    updateResponse
  );

};

async function _updateControlData( req, res, next ) {

  await controlData.setTags( req.agenda.uid );
  await controlData.setCategories( req.agenda.uid );

  next()

}

function updateResponse( req, res ) {

  if ( res.statusCode && res.statusCode !== 200 ) {

    return res.send( 'nok' );

  }

  res.send( 'ok' );

}

function show( req, res ) {

  return res.send( layout( '<div class="js_canvas"></div>', {
    role: req.member.role,
    lang: req.lang,
    agenda: req.agenda,
    bodyAttributes: [ {
      name: 'data-options',
      value: JSON.stringify( {
        updateRes: `/${req.agenda.slug}/admin/settings/customize`,
        tagSet: req.tagSet,
        categorySet: req.categorySet,
        lang: req.lang,
        useTags: req.hasTagsCred
      } )
    } ],
    scripts: {
      bottom: [ { src: '/js/customizedIndex.js' } ]
    }
  } ) );


}
