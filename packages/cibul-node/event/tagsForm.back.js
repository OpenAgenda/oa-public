"use strict";

const modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

async = require( 'async' ),

agendaSvc = require( '../services/agenda' ),

agendaTags = require( 'agenda-tags' ),

agendaCategories = require( 'agenda-categories' ),

eventSvc = require( '../services/event' ),

bodyParser = require( 'body-parser' ),

getLabel = require( 'labels' )( require( 'labels/event/tagsForm' ) ),

routes = {

  agendaEventTagsForm: [ 'get', '/', [ 
    _loadTagSet,
    _loadTags,
    _loadCategorySet,
    _loadCategory,
    xhrGet,
    eventSvc.mw.format,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oasfmain.css' ),
    page
  ] ],

  agendaEventTagsFormSubmit: [ 'post', '/', [
    _loadTagSet,
    _loadCategorySet,
    bodyParser.json(),
    _validateTags,
    _validateCategories,
    _updateTags,
    _updateCategory,
    update
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


function page( req, res, next ) {

  cmn.render( req, res, 'eventFormTags/index', {
    agenda: req.agenda,
    scriptParams: {
      lang: req.lang,
      redirect: req.query.redirect
    }
  } );

}


function xhrGet( req, res, next ) {

  if ( !req.xhr ) return next();

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


function _validateTags( req, res, next ) {

  let possibleTags = req.tagSet.groups.reduce( ( p, g ) => g.tags.concat( p ), [] ),

  submittedTags = ( req.body.event || { tags: [] } ).tags;

  if ( submittedTags.filter( st => !possibleTags.filter( t => st.slug === t.slug ).length ).length ) {

    return res.json( {
      success: false,
      message: getLabel( 'invalidTags', req.lang )
    } );

  }

  req.tags = submittedTags;

  next();

}


function _validateCategories( req, res, next ) {

  let possibleCategories = req.categorySet.categories,

  submittedCategory = ( req.body.event || { category: null } ).category;

  if ( submittedCategory && !possibleCategories.filter( c => c.id === submittedCategory.id ).length ) {

    return res.json( {
      success: false,
      message: getLabel( 'invalidCategories', req.lang )
    } );

  }

  req.category = submittedCategory;

  next();

}


function _updateTags( req, res, next ) {

  req.agenda.unassignTags( req.event, err => {

    if ( err ) return next( err );

    async.eachSeries( req.tags, ( tag, ecb ) => {

      req.agenda.assignTag( tag, req.event, ecb );

    }, next );

  } );

}


function _updateCategory( req, res, next ) {

  req.agenda.assignCategory( req.category, req.event, next );

}


function update( req, res, next ) {

  res.json( {
    success: true
  } );

}