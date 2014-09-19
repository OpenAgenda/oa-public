var debug = require('debug'),

log = debug('newsletter'),

express = require('express'),

bodyParser = require('body-parser'),

cibulModel = require('cibulModel/lib/cibulModel'),

mwLib = require('../middleware'),

async = require('async'),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require('../lib.js'), 

router = require('../router.js'),

build = require('./build');


module.exports = function( base, config ) {

  log('loading newsletter front module');

  var app = express(),

  model = cibulModel( config.db, null, { imagePath: config.aws.imageBucketPath } ),

  mw = mwLib( model, router, config );

  app.use( bodyParser.urlencoded({ extended: true }) );

  app.set( 'base', base );

  app.set( 'name', 'newsletterFront' );

  app.param( 'slug', mw.loadAgenda );

  app.all( base + '*', router.loadUrlGen(app) );

  router.loadRoutes( app, controllers( app, model, mw ));

  return app;

};


var controllers = function( app, model, mw ) {

  var generic = require('./generic')( model ),
  

  map = function() {

    return {
      newsletterShow: [ 'get', newsletterShow, '/:uid' ],
      contactUnsubscribeShow: [ 'get', contactUnsubscribeShow, '/contactlists/:uid/unsubscribe' ],
      contactUnsubscribeSubmit: [ 'post', contactUnsubscribeSubmit, '/contactlists/:uid/unsubscribe' ],
      contactUnsubscribeComplete: [ 'get', contactUnsubscribeComplete, '/contactlists/:uid/unsubscribe/complete' ]
    }

  },


  newsletterShow = function( req, res ) {

    wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

    .then(function( campaign ) {

      return wn.call( build, model, req.agenda, req.agenda.campaigns.instance( campaign ) );

    })

    .then(function( newsletterData ) {

      mw.render( req, res, 'newsletter/show', lib.extend( newsletterData, {
        type: 'html',
        previewLink: false,
        mobileMeta: true
      } ) );

    })

    .catch( _error( req, res ) );

  },


  contactUnsubscribeShow = function( req, res ) {

    req.agenda.contactLists.get({ uid: req.params.uid }, function ( err, contactList ) {

      if (err) return mw.errorResponse( req, res, err );

      mw.render(req, res, 'newsletter/unsubscribe', lib.extend(contactList, lib.extend({
        uid: req.params.uid,
        error: false
      }, _layoutData())));

    });

  },


  contactUnsubscribeSubmit = function( req, res ) {

    var values = req.body || {};

    generic.contactRemove( req.agenda, req.params.uid, values.email, function( err, result ){

      if ( err ) return mw.errorResponse( req, res, err );

      return router.redirect(req, res, 'contactUnsubscribeComplete', {uid: req.params.uid});

    }, function( error, contactList ) {

      mw.render(req, res, 'newsletter/unsubscribe', lib.extend(contactList, lib.extend({
        uid: req.params.uid,
        error: error
      }, _layoutData())));

    });

  },


  contactUnsubscribeComplete = function( req, res ) {

    req.agenda.contactLists.get({ uid: req.params.uid }, function ( err, contactList ) {

      if ( err ) return mw.errorResponse( req, res, err );

      mw.render(req, res, 'newsletter/unsubscribeComplete', lib.extend(contactList, lib.extend({
        uid: req.params.uid,
        error: false
      }, _layoutData())));

    });

  },
  

  _error = function( req, res ) {

    return function( err ) {

      if ( typeof err === 'string' ) err = { message: err };

      mw.errorResponse( req, res, err );

    };

  };

  return map();

},

_layoutData = function() {

  return {
    head: {
      css: {
        main: '//d.cibul.net/css/compiled.css'
      }
    }
  };

};