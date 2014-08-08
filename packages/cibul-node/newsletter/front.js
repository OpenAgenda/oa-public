var debug = require('debug'),

log = debug('newsletter'),

express = require('express'),

bodyParser = require('body-parser'),

cibulModel = require('cibulModel/lib/cibulModel'),

mwLib = require('../middleware'),

async = require('async'),

lib = require('../lib.js'), 

router = require('../router.js'),

build = require('./build');

module.exports = function( base, config ) {

  log('loading newsletter front module');

  var app = express(),

  model = cibulModel( config.db ),

  mw = mwLib( model, config ),

  ctl = controllers( app, model, mw );

  app.use( bodyParser.urlencoded({ extended: true }) );

  app.set( 'base', base );

  app.set( 'name', 'newsletterFront' );

  app.param( 'slug', mw.loadAgenda );

  app.all(base + '*', router.loadUrlGen(app));

  router.loadRoutes( app, {
    contactUnsubscribeShow: [ 'get', ctl.contactUnsubscribeShow, '/contactlists/:uid/unsubscribe' ],
    contactUnsubscribeSubmit: [ 'post', ctl.contactUnsubscribeSubmit, '/contactlists/:uid/unsubscribe' ],
    contactUnsubscribeComplete: [ 'get', ctl.contactUnsubscribeComplete, '/contactlists/:uid/unsubscribe/complete' ]
  });

  return app;

};


var controllers = function( app, model, mw ) {

  var generic = require('./generic')( model );

  return {

    contactUnsubscribeShow: function( req, res ) {

      req.agenda.contactLists.get({ uid: req.params.uid }, function ( err, contactList ) {

        if (err) return mw.errorResponse( req, res, err );

        mw.render(req, res, 'newsletter/unsubscribe', lib.extend(contactList, lib.extend({
          uid: req.params.uid,
          error: false
        }, _layoutData())));

      });

    },

    contactUnsubscribeSubmit: function( req, res ) {

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

    contactUnsubscribeComplete: function( req, res ) {

      req.agenda.contactLists.get({ uid: req.params.uid }, function ( err, contactList ) {

        if ( err ) return mw.errorResponse( req, res, err );

        mw.render(req, res, 'newsletter/unsubscribeComplete', lib.extend(contactList, lib.extend({
          uid: req.params.uid,
          error: false
        }, _layoutData())));

      });

    },

  };

},

_layoutData = function() {

  return {
    head: {
      css: {
        main: '//d.cibul.net/css/main.min.css'
      }
    }
  };

};