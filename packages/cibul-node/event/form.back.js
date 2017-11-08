"use strict";

const sessions = require( '@openagenda/sessions' );
const agendaSvc = require( '../services/agenda' );
const eventSvc = require( '../services/event' );


var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

imageUpload = require( '@openagenda/image-upload/lib/middleware' ),

routes = {

  agendaEventNewCustomUpload: [ 'post', '/:slug/events/new/custom/:field/upload/key/:fileKey', [ 
    sessions.middleware.load(),
    agendaEventNewCustomUpload
  ] ],

  agendaEventNewCustomRemove: [ 'post', '/:slug/events/new/custom/:field/remove/key/:fileKey', [ 
    sessions.middleware.load(),
    agendaEventNewCustomRemove 
  ] ],

  agendaEventCustomUpload: [ 'post', '/:slug/events/:eventSlug/edit/custom/:field/upload/key/:fileKey', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    agendaEventCustomUpload
  ] ],

  agendaEventCustomRemove: [ 'post', '/:slug/events/:eventSlug/edit/custom/:field/remove/key/:fileKey', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
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


function agendaEventNewCustomUpload( req, res, next ) {

  imageUpload( {
    dest: config.tmpFolderPath,
    handler: function( path, info, cb ) {

      var newEvent = req.agenda.events.new();

      newEvent.loadAgendaCustomContext( {
        uid: req.agenda.uid,
        customFields: req.agenda.getCustomFieldsConfig()
      } );

      newEvent.setCustomImage( {
        name: req.params.field,
        path: path,
        fileKey: req.params.fileKey
      }, cb );

    }
  } )( req, res, next );

}

function agendaEventNewCustomRemove( req, res, next ) {

  var newEvent = req.agenda.events.new();

  newEvent.loadAgendaCustomContext( {
    uid: req.agenda.uid,
    customFields: req.agenda.getCustomFieldsConfig()
  });

  newEvent.unsetCustomImage( {
    name: req.params.field,
    fileKey: req.params.fileKey
  }, ( err ) => {

    if ( err ) return next( err );

    res.send( 'ok' );

  });

}

function agendaEventCustomUpload( req, res, next ) {

  req.log( 'processing uploaded image' );

  imageUpload( {
    dest: config.tmpFolderPath,
    handler: function( path, info, cb ) {

      req.event.loadAgendaCustomContext( {
        uid: req.agenda.uid,
        customFields: req.agenda.getCustomFieldsConfig()
      });

      req.event.setCustomImage( {
        name: req.params.field,
        path: path,
        fileKey: req.params.fileKey
      }, cb );

    }
  } )( req, res, next );

}

function agendaEventCustomRemove( req, res, next ) {

  req.event.loadAgendaCustomContext( {
    uid: req.agenda.uid,
    customFields: req.agenda.getCustomFieldsConfig()
  });

  req.event.unsetCustomImage( {
    name: req.params.field,
    fileKey: req.params.fileKey
  }, ( err ) => {

    if ( err ) return next( err );

    res.send( 'ok' );

  });

}



function _checkField( req, res, next ) {

  // to know if field exists, one must check in custom field
  // configuration

  if ( !req.agenda.hasCustomField( req.params.field ) ) {

    return next( { code: 400, message: 'Non-existing field' } );

  }

  next();

}