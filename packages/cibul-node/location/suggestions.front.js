"use strict";

const modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

bodyParser = require( 'body-parser' ),

agendaSvc = require( '../services/agenda' ),

locationSvc = require( 'agenda-locations' ),

stakeholderMw = require( 'agenda-stakeholders/middleware' );

let mw = locationSvc.mw();

var routes = {

  locationSuggestion: [ 'get', '',  [
    xhrSuggestion,
    suggestionForm
  ] ],

  locationSuggestionSet: [ 'post', '', [
    bodyParser.json(),
    mw.setSuggestion
  ] ],

  locationSuggestionImageUpload: [ 'post', '/image', mw.suggestionImageUpload ],

  locationSuggestionImageRemove: [ 'post', '/image/remove', mw.suggestionImageRemove ]

}

module.exports = function( path ) {

  let router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession,
    cmn.requireLogged( { redirect: 'agendaSignup', redirectParams: [ 'slug' ] } ),
    cmn.loadUserUid,
    agendaSvc.mw.load( 'slug' ),
    cmn.checkStakeholder,
    stakeholderMw.load( 'agenda', 'user', 'stakeholder' ),
    ( req, res, next ) => { req.stakeholderId = req.stakeholder.id; next(); },
    mw.load,
    cmn.loadBaseData( 'oasfmain.css' ),
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function xhrSuggestion( req, res, next ) {

  if ( !req.xhr ) return next();

  mw.getSuggestionFormData( req, res, next );

}

function suggestionForm( req, res, next ) {

  let redirect = req.genUrl( 'agendaShow', { slug: req.agenda.slug } );

  if ( req.query.eventSlug ) {

    redirect = req.genUrl( 'agendaEventShow', {
      slug: req.agenda.slug, 
      eventSlug: req.query.eventSlug
    } );

  }

  cmn.render( req, res, 'locations/suggestionForm', {
    scriptParams: {
      lang: req.lang,
      locationUid: req.location.uid,
      res: {
        getSuggestion: req.genUrl( 'locationSuggestion', { slug: req.agenda.slug } ),
        setSuggestion: req.genUrl( 'locationSuggestionSet', { slug: req.agenda.slug } ),
        geocode: req.genUrl( 'locationGeocode', { slug: req.agenda.slug } ),
        image: {
          upload: req.genUrl( 'locationSuggestionImageUpload', { slug: req.agenda.slug, 'locationUid' : ':locationUid' } ),
          remove: req.genUrl( 'locationSuggestionImageRemove', { slug: req.agenda.slug, 'locationUid' : ':locationUid' } )
        }
      },
      redirects: {
        success: redirect,
        cancel: redirect
      }
    }
  } );

}