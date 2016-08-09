"use strict";

const modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

agendaSvc = require( '../services/agenda' ),

agendaTags = require( 'agenda-tags' ),

agendaCategories = require( 'agenda-categories' ),

eventSvc = require( '../services/event' ),

routes = {

  agendaEventTagsForm: [ 'get', '/', [ 
    _loadTagSet,
    _loadTags,
    _loadCategorySet,
    _loadCategory,
    get 
  ] ]

}

module.exports = path => {

  let router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    cmn.loadSession,
    cmn.requireLogged(),
    cmn.checkAdminOrModerator
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function _loadTags( req, res, next ) {

  req.event.getAgendaTags( ( err, tags ) => {

    if ( err ) return next( err );

    req.agendaTags = tags;

    next();

  } );

}


function _loadCategory( req, res, next ) {

  req.event.getAgendaCategory( ( err, category ) => {

    if ( err ) return next( err );

    req.agendaCategory = category;

    next();

  } );

}


function _loadTagSet( req, res, next ) {

  agendaTags.get( req.agenda.id, ( err, tagSet ) => {

    if ( err ) return next( err );

    req.tagSet = tagSet;

    next();

  } );

}


function _loadCategorySet( req, res, next ) {

  agendaCategories.get( req.agenda.id, ( err, categorySet ) => {

    if ( err ) return next( err );

    req.categorySet = categorySet;

    next();

  } );

}


function get( req, res, next ) {

  res.json( {
    event: {
      title: req.event.title,
      tags: req.agendaTags,
      category: req.agendaCategory
    },
    categorySet: req.categorySet,
    tagSet: req.tagSet
  } ); 

}