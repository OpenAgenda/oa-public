"use strict";

var modLib = require( '../lib/moduleLib' ),

log = require( '../lib/logger' )( 'newsletter/front' ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ), 

cmn = require( '../lib/commons-app' ),

build = require( './build' ),

model = cmn.getCibulModel(),

generic = require( './generic' )( model ),

agendaSvc = require( '../services/agenda/agenda' ),

routes = {
  newsletterShow: [ 'get', '/:uid', newsletterShow ],
  contactUnsubscribeShow: [ 'get', '/contactlists/:uid/unsubscribe', contactUnsubscribeShow ],
  contactUnsubscribeSubmit: [ 'post', '/contactlists/:uid/unsubscribe', contactUnsubscribeSubmit ],
  contactUnsubscribeComplete: [ 'get', '/contactlists/:uid/unsubscribe/complete', contactUnsubscribeComplete ]
};


module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    agendaSvc.mw.load( 'slug' ),
    cmn.loadBaseData()
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

};

function newsletterShow( req, res ) {

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then(function( campaign ) {

    return wn.call( build, model, req.agenda, req.agenda.campaigns.instance( campaign ) );

  })

  .then(function( newsletterData ) {

    cmn.render( req, res, 'newsletter/show', lib.extend( newsletterData, {
      type: 'html',
      previewLink: false,
      mobileMeta: true
    } ) );

  })

  .catch( _error( req, res ) );

}



function contactUnsubscribeShow( req, res ) {

  req.agenda.contactLists.get({ uid: req.params.uid }, function ( err, contactList ) {

    if ( err ) return cmn.errorResponse( req, res, err );

    cmn.render( req, res, 'newsletter/unsubscribe', lib.extend( contactList, lib.extend({
      uid: req.params.uid,
      error: false
    } )));

  });

}



function contactUnsubscribeSubmit( req, res ) {

  var values = req.body || {};

  generic.contactRemove( req.agenda, req.params.uid, values.email, function( err, result ){

    if ( err ) return cmn.errorResponse( req, res, err );

    return cmn.redirect(req, res, 'contactUnsubscribeComplete', {uid: req.params.uid});

  }, function( error, contactList ) {

    cmn.render(req, res, 'newsletter/unsubscribe', lib.extend(contactList, lib.extend({
      uid: req.params.uid,
      error: error
    } )));

  });

}



function contactUnsubscribeComplete( req, res ) {

  req.log( 'info', 'request received for contactUnsubscribeComplete with contact list uid = %d', req.params.uid );

  req.agenda.contactLists.get({ uid: req.params.uid }, function ( err, contactList ) {

    if ( err ) return cmn.errorResponse( req, res, err );

    cmn.render(req, res, 'newsletter/unsubscribeComplete', lib.extend(contactList, lib.extend({
      uid: req.params.uid,
      error: false
    } )));

  });

}



function _error( req, res ) {

  return function( err ) {

    if ( typeof err === 'string' ) err = { message: err };

    cmn.errorResponse( req, res, err );

  };

}