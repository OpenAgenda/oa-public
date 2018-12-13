"use strict";

const modLib = require( '../lib/moduleLib' ),

  sessions = require( '@openagenda/sessions' ),

  cmn = require( '../lib/commons-app' ),

  async = require( 'async' ),

  agendaSvc = require( '../services/agenda' ),

  agendaTags = require( '@openagenda/agenda-tags' ),

  agendaCategories = require( '@openagenda/agenda-categories' ),

  eventSvc = require( '../services/event' ),

  _ = require( 'lodash' ),

  getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/event/tagsForm' ) ),

  routes = {

    agendaEventTagsForm: [ 'get', '/', [
      _loadTagSet,
      _loadTags,
      _loadCategorySet,
      _loadCategory,
      _loadCustomSet,
      _loadCustom,
      xhrGet,
      eventSvc.mw.format,
      cmn.loadBaseData( eventSvc.mw.layoutData, 'oasfmain.css' ),
      page
    ] ],

    agendaEventTagsFormSubmit: [ 'post', '/', [
      _loadTagSet,
      _loadCategorySet,
      _loadCustomSet,
      _validateTags,
      _validateCategories,
      _updateCustom,
      update
    ] ]

  }

module.exports = path => {

  let router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    sessions.middleware.ifUnlogged( cmn.redirectTo() ),
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


function _loadCustomSet( req, res, next ) {

  req.customSet = req.agenda.getCustomFieldsConfig();

  next();

}

function _loadCustom( req, res, next ) {

  req.agenda.getEventPublicCustomData( req.event, ( err, customFields ) => {

    if ( err ) return next( err );

    req.agendaCustom = {};

    if ( !_.isArray( customFields ) ) return next();

    req.agendaCustom = customFields.reduce( ( carry, c ) => {

      carry[ c.name ] = c.value;

      return carry;

    }, {} );

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
      category: req.agendaCategory,
      custom: req.agendaCustom,
    },
    languages: req.event.getLanguages(),
    categorySet: req.categorySet,
    tagSet: req.tagSet,
    customSet: req.customSet
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


function _updateCustom( req, res, next ) {

  if ( !req.customSet || ( !req.body.event && !req.body.event.custom ) ) {

    return next();

  }

  let fieldNames = req.customSet.map( c => c.name ),

    lastField = fieldNames.pop();

  async.eachSeries( fieldNames, ( field, ecb ) => {

    req.event.setCustomField( field, req.body.event.custom[ field ], false, ecb );

  }, err => {

    if ( err ) return next( err );

    req.event.setCustomField( lastField, req.body.event.custom[ lastField ], true, err => {

      if ( err ) return next( err );

      next();

    } );

  } );

}


function update( req, res, next ) {

  req.agenda.setEventTagsAndCategory( req.event, req.tags, req.category, err => {

    if ( err ) return next( err );

    res.json( {
      success: true
    } );

  } );

}
