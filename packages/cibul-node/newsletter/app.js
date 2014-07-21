/**
 * load libraries
 */

var debug = require('debug'),

log = debug('newsletter'),

express = require('express'),

cibulModel = require('cibulModel/lib/cibulModel'),

mwLib = require('../middleware'),

async = require('async'),

lib = require('../lib.js'), 

router = require('../router.js');

module.exports = function(base, config) {

  log('loading newsletter module');

  // load app dependencies

  var app = express(),

  model = cibulModel(config.db),

  mw = mwLib(model, config),

  ctl = controllers(app, model, mw);

  app.set('base', base);

  app.set('name', 'newsletter');


  // systematic module checks and loads

  app.param('slug', mw.loadAgenda);

  app.all(base + '*', router.loadUrlGen(app), mw.requireLogged, mw.loadSession, mw.checkCredential(model, 'newsletter'));


  // load module controllers

  router.loadRoutes(app, {
    newsletterIndex: ['get', ctl.index, ''],
    campaignNew: ['get', ctl.campaignNew, '/campaigns/new'],
    campaignCreate: ['post', ctl.campaignCreate, '/campaigns'],
    campaignRemove: ['get', ctl.campaignRemove, '/campaigns/:uid/remove'],
    campaignEdit: ['get', ctl.campaignEdit, '/campaigns/:uid/edit'],
    campaignUpdate: ['post', ctl.campaignUpdate, '/campaigns/:uid/update'],
    contactListNew: ['get', ctl.contactListNew, '/contactlists/new'],
    contactListCreate: ['post', ctl.contactListCreate, '/contactlists'],
    contactListShow: ['get', ctl.contactListShow, '/contactlists/:uid'],
    contactListRemove: ['get', ctl.contactListRemove, '/contactlists/:uid/remove']
  });

  return app;

};


var controllers = function( app, model, mw ) {

  return {

    index: function(req, res) {

      log('received index request for agenda "%s"', req.agenda.title);

      var agenda = model.agendas().instance(req.agenda);

      async.parallel([

        agenda.campaigns.list,
        agenda.contactLists.list

      ], function(err, results) {

        if (err) return mw.errorResponse(req, res, err);

        mw.render(req, res, 'newsletter/admin/index', lib.extend({
          campaigns: results[0],
          contactLists: results[1],
        }, _layoutData(req.agenda)));

      });

    },


    campaignNew: function( req, res ) {

      

    },


    campaignCreate: function( req, res ) {

    },


    campaignRemove: function( req, res ) {

    },


    campaignEdit: function( req, res ) {

    },


    campaignUpdate: function( req, res ) {

    },


    contactListNew: function( req, res ) {

    },


    contactListCreate: function( req, res ) {

    },


    contactListShow: function( req, res ) {

    },


    contactListRemove: function( req, res ) {

    }

  };

},



/**
 * prepare form for new campaign
 */


_layoutData = function( agenda ) {

  return {
    tab: 'newsletter',
    mainClass: 'newsletter',
    head: {
      css: {
        main: '//d.cibul.net/css/main.min.css'
      }
    },
    agenda: {
      title: agenda.title,
      description: agenda.description,
      url: agenda.url,
      image: '//cibul.s3.amazonaws.com/' + agenda.image
    }
  };

};