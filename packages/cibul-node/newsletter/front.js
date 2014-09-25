/**
 * load libraries and define app module routes
 */

var appName = 'newsletter/front',

exposed = {
  load: load
},

routes = {
  newsletterShow: [ 'get', newsletterShow, '/:uid' ],
  contactUnsubscribeShow: [ 'get', contactUnsubscribeShow, '/contactlists/:uid/unsubscribe' ],
  contactUnsubscribeSubmit: [ 'post', contactUnsubscribeSubmit, '/contactlists/:uid/unsubscribe' ],
  contactUnsubscribeComplete: [ 'get', contactUnsubscribeComplete, '/contactlists/:uid/unsubscribe/complete' ]
},

log = require( '../lib/logger' )( appName ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ), 

cmn = require( '../lib/commons-app' ),

build = require('./build'),

app,

path,

model = cmn.getCibulModel(),

generic = require( './generic' )( model );


function init( p ) {

  log( 'initing' );

  path = p;

  cmn.registerRoutes( appName, path, routes );

  return exposed;

}



function load( main ) {

  if ( app ) {

    log( 'this app has already been loaded');

    return;

  }

  log( 'loading' );

  app = cmn.loadApp( main, path, appName );

  app.param( 'slug', cmn.loadAgenda );

  cmn.loadRoutes( app, routes, [
    cmn.urlGenSetter( appName, path )
  ] );

}



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

    if (err) return cmn.errorResponse( req, res, err );

    cmn.render(req, res, 'newsletter/unsubscribe', lib.extend(contactList, lib.extend({
      uid: req.params.uid,
      error: false
    }, _layoutData())));

  });

}



function contactUnsubscribeSubmit( req, res ) {

  var values = req.body || {};

  generic.contactRemove( req.agenda, req.params.uid, values.email, function( err, result ){

    if ( err ) return cmn.errorResponse( req, res, err );

    return router.redirect(req, res, 'contactUnsubscribeComplete', {uid: req.params.uid});

  }, function( error, contactList ) {

    cmn.render(req, res, 'newsletter/unsubscribe', lib.extend(contactList, lib.extend({
      uid: req.params.uid,
      error: error
    }, _layoutData())));

  });

}



function contactUnsubscribeComplete( req, res ) {

  req.agenda.contactLists.get({ uid: req.params.uid }, function ( err, contactList ) {

    if ( err ) return cmn.errorResponse( req, res, err );

    cmn.render(req, res, 'newsletter/unsubscribeComplete', lib.extend(contactList, lib.extend({
      uid: req.params.uid,
      error: false
    }, _layoutData())));

  });

}



function _error( req, res ) {

  return function( err ) {

    if ( typeof err === 'string' ) err = { message: err };

    cmn.errorResponse( req, res, err );

  };

}


function _layoutData() {

  return {
    head: {
      css: {
        main: '//d.cibul.net/css/compiled.css'
      }
    }
  };

};


module.exports = init;