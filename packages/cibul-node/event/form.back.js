"use strict";

const _ = require( 'lodash' );
const sessions = require( '@openagenda/sessions' );
const agendaSvc = require( '../services/agenda' );
const eventSvc = require( '../services/event' );
const config = require( '../config' );

const multer = require( 'multer' );

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

imageUpload = require( '@openagenda/image-upload/lib/middleware' ),

routes = {

  agendaEventNewCustomUpload: [ 'post', '/:slug/events/new/custom/:field/upload/key/:fileKey', [ 
    sessions.middleware.load(),
    _loadFieldType,
    agendaEventCustomUpload.bind( null, true )
  ] ],

  agendaEventNewCustomRemove: [ 'post', '/:slug/events/new/custom/:field/remove/key/:fileKey', [ 
    sessions.middleware.load(),
    _loadFieldType,
    agendaEventNewCustomRemove 
  ] ],

  agendaEventCustomUpload: [ 'post', '/:slug/events/:eventSlug/edit/custom/:field/upload/key/:fileKey', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _loadFieldType,
    agendaEventCustomUpload.bind( null, false )
  ] ],

  agendaEventCustomRemove: [ 'post', '/:slug/events/:eventSlug/edit/custom/:field/remove/key/:fileKey', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _loadFieldType,
    agendaEventCustomRemove
  ] ]

}

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
    sessions.middleware.ifUnlogged( cmn.redirectTo() ),
    cmn.checkContributor,
    _checkField
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function _loadFieldType( req, res, next ) {

  const field = _.head( req.agenda.getCustomFieldsConfig().filter( f => f.name === req.params.field ) );

  if ( !field ) return next();

  req.fieldType = field.fieldType;

  req.fieldExtension = field.extension;

  next();

}


function agendaEventCustomUpload( isNew, req, res, next ) {

  const event = isNew ? req.agenda.events.new() : req.event;

  event.loadAgendaCustomContext( {
    uid: req.agenda.uid,
    customFields: req.agenda.getCustomFieldsConfig()
  });

  ( req.fieldType === 'image' ? _processImageFile : _processFile )( req, res, next, ( path, cb ) => {

    event.setCustomFile( {
      name: req.params.field,
      path: path,
      fileKey: req.params.fileKey
    }, cb );

  } );

}

function agendaEventNewCustomRemove( req, res, next ) {

  var newEvent = req.agenda.events.new();

  newEvent.loadAgendaCustomContext( {
    uid: req.agenda.uid,
    customFields: req.agenda.getCustomFieldsConfig()
  });

  newEvent.unsetCustomFile( {
    name: req.params.field,
    fileKey: req.params.fileKey,
  }, ( err ) => {

    if ( err ) return next( err );

    res.send( 'ok' );

  });

}


function agendaEventCustomRemove( req, res, next ) {

  req.event.loadAgendaCustomContext( {
    uid: req.agenda.uid,
    customFields: req.agenda.getCustomFieldsConfig()
  });

  req.event.unsetCustomFile( {
    name: req.params.field,
    fileKey: req.params.fileKey
  }, ( err ) => {

    if ( err ) return next( err );

    res.send( 'ok' );

  });

}

function _processImageFile( req, res, next, set ) {

  imageUpload( {
    dest: config.tmpFolderPath,
    handler: function( path, info, cb ) {

      set( path, ( err, result ) => {

        cb( err, err ? null : result.path );

      } );

    }
  } )( req, res, next );

}


function _processFile( req, res, next, set ) {

   multer( {
    dest: config.tmpFolderPath,
    fileFilter: ( req, file, cb ) => {

      const expectedType = ( {
        pdf: 'application/pdf'
      } )[ req.fieldExtension ];

      cb( null, expectedType === file.mimetype );

    }
  } ).single( 'file' )( req, res, err => {

    if ( err ) return next( err );

    set( req.file.path, ( err, result ) => {

      if ( err ) return next( err );

      res.json( _.extend( result, {
        name: req.file.originalname
      } ) );

    } );

  } );

}


function _checkField( req, res, next ) {

  // to know if field exists, one must check in custom field
  // configuration

  if ( !req.agenda.hasCustomField( req.params.field ) ) {

    return next( { code: 400, message: 'Non-existing field' } );

  }

  next();

}