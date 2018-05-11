"use strict";

const _ = require( 'lodash' );
const multer = require( 'multer' );

const imageUpload = require( '@openagenda/image-upload/lib/middleware' );
const sessions = require( '@openagenda/sessions' );

const agendaSvc = require( '../services/agenda' );
const cmn = require( '../lib/commons-app' );
const config = require( '../config' );
const eventSvc = require( '../services/event' );
const modLib = require( '../lib/moduleLib' );

const routes = {

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

  const router = modLib.Router( routes );

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

  req.authorizedExtensions = [].concat( field.extension );

  next();

}


function agendaEventCustomUpload( isNew, req, res, next ) {

  const event = isNew ? req.agenda.events.new() : req.event;

  event.loadAgendaCustomContext( {
    uid: req.agenda.uid,
    customFields: req.agenda.getCustomFieldsConfig()
  });

  ( req.fieldType === 'image' ? _processImageFile : _processFile )( req, res, next, ( path, extension, cb ) => {

    event.setCustomFile( {
      name: req.params.field,
      path,
      fileKey: req.params.fileKey,
      extension
    }, cb );

  } );

}

function agendaEventNewCustomRemove( req, res, next ) {

  const newEvent = req.agenda.events.new();

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
    handler: ( path, info, cb ) => {

      set( path, 'jpg', ( err, result ) => {

        cb( err, err ? null : result.path );

      } );

    }
  } )( req, res, next );

}


function _processFile( req, res, next, set ) {

  let extension;

   multer( {
    dest: config.tmpFolderPath,
    fileFilter: ( req, file, cb ) => {

      const authorizedMimetypes = req.authorizedExtensions.map( ext => config.authorizedMimeTypes[ ext ] );

      if ( !authorizedMimetypes.includes( file.mimetype ) ) {

        return cb( null, false );

      } else {

        extension = req.authorizedExtensions[ authorizedMimetypes.indexOf( file.mimetype ) ];

        cb( null, true );

      }

    }
  } ).single( 'file' )( req, res, err => {

    if ( err ) return next( err );

    set( req.file.path, extension, ( err, result ) => {

      if ( err ) return next( err );

      res.json( _.extend( result, {
        name: req.file.originalname
      } ) );

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