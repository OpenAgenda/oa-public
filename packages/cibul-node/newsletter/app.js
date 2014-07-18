var R_METHOD = 0, R_CONTROLLER = 1, R_URI = 2;

module.exports = function(base, config) {

  var route, name;

  log('loading newsletter module');

  routes = {
    index: ['get', index, '/grrruuuut'],
    /*campaignNew: ['get', 'campaignNew', '/campaigns/new'],
    campaignCreate: ['post', 'campaignCreate', '/campaigns'],
    campaignRemove: ['get', 'campaignRemove', '/campaigns/:uid/remove'],
    campaignEdit: ['get', 'campaignEdit', '/campaigns/:uid/edit'],
    campaignUpdate: ['post', 'campaignUpdate', '/campaigns/:uid/update'],
    contactListNew: ['get', 'contactListNew', '/contactlists/new'],
    contactListCreate: ['post', 'contactListCreate', '/contactlists'],
    contactListShow: ['get', 'contactListShow', '/contactlists/:uid'],
    contactListRemove: ['get', 'contactListRemove', '/contactlists/:uid/remove'],*/
  };

  // load app dependencies

  var app = express(),

  model = cibulModel(config.db),

  mw = mwLib(model, config);

  // systematic controller checks

  app.param('slug', mw.loadAgenda);

  app.all(base + '*', mw.basePath(base), mw.loadUrlGenerator(routes), mw.requireLogged, mw.loadSession, mw.checkCredential(model, 'newsletter'));

  for (name in routes) {

    route = routes[name];

    if (route[R_CONTROLLER]) app[route[R_METHOD]](base + route[R_URI], route[R_CONTROLLER](model, mw));

  }

  return app;

};


/**
 * load libraries
 */

var debug = require('debug'),

log = debug('newsletter'),

express = require('express'),

cibulModel = require('cibulModel/lib/cibulModel'),

mwLib = require('../middleware'),

templater = require('cibulTemplates/server/templater')(),

async = require('async'),

lib = require('../lib.js'), 

routes,


/**
 * controllers
 */


/**
 * show the listing of campaigns and contact lists
 */

index = function(model, mw) {
  
  return function(req, res) {

    log('received index request for agenda "%s"', req.agenda.title);

    var agenda = model.agendas().instance(req.agenda);

    async.parallel([

      agenda.campaigns.list,
      agenda.contactLists.list

    ], function(err, results) {

      if (err) return mw.errorResponse(req, res, err);

      var data = lib.extend({
        campaigns: results[0],
        contactLists: results[1],
        urls: {
          newCampaign : "#createcampaign",
          newContactList : "#createcontactlist"
        },
        genUrl: req.genUrl
      }, _layoutData(req.agenda));

      // testing
      var url = req.genUrl('index');

      // for each item, load the instance

      templater('newsletter/admin/index', {
        "tab" : "newsletter",
        "mainClass" : "newsletter",
        "head" : {
          "css" : {
            "main" : "//d.cibul.net/css/main.min.css"
          }
        },
        "agenda" : {
          "title" : "La Gargouille",
          "image" : "//cibul.s3.amazonaws.com/review_la-gargouille_00.jpg",
          "description" : "L'agenda de la Gargouille"
        },
        "campaigns" : [
          {
            "name" : "Une campagne automatique",
            "type" : 1,
            "frequencyType" : 0,
            "list" : {
              "name" : "Liste principale",
              "url" : "#urlofthatlist"
            },
            "sendDate" : "2014-07-30T09:00:00.000Z"
          },
          {
            "name" : "Ma campagne à la main",
            "type" : 0,
            "list" : null,
            "sendDate" : "2014-07-15T10:30:00.000Z"
          },
          {
            "name" : "Ma campagne auto désactivée",
            "type" : 0,
            "frequencyType" : 1,
            "list" : {
              "name" : "Un autre liste",
              "url" : "urlofthislist"
            },
            "sendDate" : null
          }
        ],
        "contactLists" : [
        ],
        "urls" : {
          "newCampaign" : "#createcampaign",
          "newContactList" : "#createcontactlist"
        }
      }, function(err, render) {

        if (err) throw err;

        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          'Cache-Control': 'no-cache'
        });

        res.write(render);
        res.end();

        res.send();

      });

    });

  };

},


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