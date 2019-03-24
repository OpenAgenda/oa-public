"use strict";

const _ = require( 'lodash' );

const agendaSvc = require( '@openagenda/agendas' );
const sessions = require( '@openagenda/sessions' );

const labels = require( '@openagenda/labels/agenda-tags/editor' );

const cmn = require( '../lib/commons-app' );
const modLib = require( '../lib/moduleLib' );
const tagMw = require( '@openagenda/agenda-tags' ).mw( 'agenda.id', 'tagSet' );
const categoryMw = require( '@openagenda/agenda-categories' ).mw( 'agenda.id', 'categorySet' );

const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'customized' }
);

const routes = {

  customizedShow: [ 'get', '/:slug/admin/settings/customize', cmn.verifyIPMiddleware.concat( [
    _loadAgenda,
    _checkAdmin,
    cmn.checkCredential( 'tags', { namespace: 'hasTagsCred' } ),
    tagMw.get,
    categoryMw.get,
    show
  ] ) ],

  customizedUpdate: [ 'post', '/:slug/admin/settings/customize', cmn.verifyIPMiddleware.concat( [
    _loadAgenda,
    _checkAdmin,
    tagMw.set,
    categoryMw.set,
    updateResponse
  ] ) ]

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

function updateResponse( req, res ) {

  if ( res.statusCode && res.statusCode !== 200 ) {

    return res.send( 'nok' );

  }

  res.send( 'ok' );

}

function show( req, res ) {

  return res.send( layout( '<div class="js_canvas"></div>', {
    lang: req.lang,
    agenda: req.agenda,
    bodyAttributes: [ {
      name: 'data-options',
      value: JSON.stringify( {
        updateRes: req.genUrl( 'customizedUpdate', { slug: req.agenda.slug } ),
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



function _loadAgenda( req, res, next ) {

  agendaSvc.get( _.pick( req.params, [ 'slug' ] ), {
    private: null,
    internal: true,
    includeImagePath: true
  } ).then( agenda => {

    if ( !agenda ) return next( { code: 404 } );

    _.assign( req, { agenda } );

    next();

  }, next );

}


function _checkAdmin( req, res, next) {

  cmn.loadMemberRole( 'agenda', req, res, err => {

    if ( err ) return next( err );

    if ( [ 'administrator' ].includes( req.role ) ) return next();

    next( { code: 403 } );

  } );

}
