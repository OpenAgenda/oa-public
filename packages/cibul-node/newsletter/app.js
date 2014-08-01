/**
 * load libraries
 */

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

module.exports = function(base, config) {

  log('loading newsletter module');

  // load app dependencies

  var app = express(),

  model = cibulModel(config.db),

  mw = mwLib(model, config),

  ctl = controllers(app, model, mw);

  app.use(bodyParser.urlencoded({ extended: true }));

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
    campaignLayoutEdit: ['get', ctl.campaignLayoutEdit, '/campaigns/:uid/layout'],
    campaignLayoutUpdate: ['post', ctl.campaignLayoutUpdate, '/campaigns/:uid/layout'],
    newsletterShow: ['get', ctl.newsletterShow, '/campaigns/:uid/newsletter'],
    contactListNew: ['get', ctl.contactListNew, '/contactlists/new'],
    contactListCreate: ['post', ctl.contactListCreate, '/contactlists'],
    contactListShow: ['get', ctl.contactListShow, '/contactlists/:uid'],
    contactListRemove: ['get', ctl.contactListRemove, '/contactlists/:uid/remove'],
    contactsAdd: ['post', ctl.contactsAdd, '/contactlists/:uid/contacts'],
    contactRemove: ['get', ctl.contactRemove, '/contactlist/:uid/contacts/:email/remove'],
    newsletterIndexRedirect: ['get', ctl.indexRedirect, '/campaigns'],
  });

  return app;

};


var controllers = function( app, model, mw ) {

  return {

    index: function( req, res ) {

      log('received index request for agenda "%s"', req.agenda.title);

      async.parallel([

        req.agenda.campaigns.list,
        req.agenda.contactLists.list

      ], function ( err, results ) {

        if (err) return mw.errorResponse(req, res, err);

        mw.render(req, res, 'newsletter/admin/index', lib.extend({
          campaigns: results[0],
          contactLists: results[1],
        }, _layoutData(req.agenda)));

      });

    },

    indexRedirect: function ( req, res ) {

      return router.redirect(req, res, 'newsletterIndex');

    },

    campaignNew: function( req, res ) {

      async.parallel([

        req.agenda.contactLists.list

      ], function ( err, results ) {

        if (err) return mw.errorResponse( req, res, err );

        mw.render(req, res, 'newsletter/admin/campaignForm', lib.extend({
          uid: null,
          contactLists: results[0],
          values: {}, errors: {}
        }, _layoutData(req.agenda)));

      });

    },

    campaignCreate: function( req, res ) {

      async.parallel([

        req.agenda.contactLists.list

      ], _processCampaignSave(req, function( err, result) {

        // save was successful... or crashed altogether

        if (err) return mw.errorResponse( req, res, err );

        router.redirect(req, res, 'campaignLayoutEdit', { uid: result.object.uid });

      }, function( errors, values, contactLists ) {

        // ... some things are missing or wrong

        mw.render(req, res, 'newsletter/admin/campaignForm', lib.extend({
          uid: null,
          contactLists: contactLists,
          values: values,
          errors: errors
        }, _layoutData(req.agenda)));

      }));

    },

    campaignRemove: function( req, res ) {

      req.agenda.campaigns.get({uid: req.params.uid}, function ( err, result ) {

        if (err) return mw.errorResponse(req, res, err);

        req.agenda.campaigns.instance(result).remove(function ( err, result ) {

          if (err) return mw.errorResponse(req, res, err);

          return router.redirect(req, res, 'newsletterIndex');

        });

      });

    },

    campaignEdit: function( req, res ) {

      async.parallel([

        req.agenda.contactLists.list,
        async.apply(req.agenda.campaigns.get, {uid: req.params.uid})

      ], function ( err, results ) {

        if (err) return mw.errorResponse(req, res, err);

        var campaign = req.agenda.campaigns.instance(results[1]),

        contactLists = results[0],

        values = {
          title: campaign.title,
          type: campaign.type,
        };

        if ( campaign.contactListId ) { // form matches contact list by uid

          values.list = lib.getByAttr(results[0], { id: campaign.contactListId }).uid;

        }

        // get contactList list matching the selected uid

        mw.render(req, res, 'newsletter/admin/campaignForm', lib.extend({
          uid: req.params.uid,
          contactLists: contactLists,
          values: values,
          errors: {}
        }, _layoutData(req.agenda)));

      });

    },

    campaignUpdate: function( req, res ) {

      async.parallel([

        req.agenda.contactLists.list

      ], _processCampaignSave(req, function( err, result) {

        // save was successful... or crashed altogether

        if (err) return mw.errorResponse( req, res, err );

        router.redirect(req, res, 'campaignEdit', { uid: result.object.uid });

      }, function( errors, values, contactLists ) {

        // ... some things are missing or wrong

        mw.render(req, res, 'newsletter/admin/campaignForm', lib.extend({
          uid: req.params.uid,
          contactLists: contactLists,
          values: values,
          errors: errors
        }, _layoutData(req.agenda)));

      }));

    },


    campaignLayoutEdit: function( req, res ) {

      req.agenda.campaigns.get({uid: req.params.uid}, function ( err, campaign ) {

        if (err) return mw.errorResponse(req, res, err);

        async.series([
          async.apply(req.agenda.categories.list),
          async.apply(req.agenda.getDepartments),
          async.apply(req.agenda.getRegions),
          async.apply(req.agenda.getCities)
        ], function( err, results ) {

          if (err) return mw.errorResponse(req, res, err);

          mw.render(req, res, 'newsletter/admin/campaignLayoutForm', lib.extend({
            uid: req.params.uid,
            type: 'manual',
            categories: results[0],
            departments: results[1],
            regions: results[2],
            cities: results[3],
            values: {
              cities: {},
              departments: {},
              regions: {}
            },
            errors: {}
          }, _layoutData(req.agenda)));

        });

      });

    },


    campaignLayoutUpdate: function( req, res ) {

      req.agenda.campaigns.get( { uid: req.params.uid }, function ( err, campaign ) {

        if ( err ) return mw.errorResponse( req, res, err );

        var values = req.body || {},

        filterValues = {};

        campaign = req.agenda.campaigns.instance( campaign );

        async.series([

          async.apply(campaign.setEdito, values.edito),

          async.apply(campaign.setSegmentation, values.segmentation),

          function ( scb ) { // load filters

            [ 'category', 'cities', 'departments', 'regions' ].forEach(function( filterName ) {

              // this will need to be in its own lib

              var value = values[filterName],

              clean;

              if ( !value ) return;

              if ( typeof value == 'object' ) {

                // assuming this is a check box

                clean = [];

                for ( var name in value ) {

                  clean.push(name);

                }

              } else {

                clean = value;

              }

              filterValues[filterName] = clean;

            });

            campaign.setFilters( filterValues, scb );

          },

        ], function( err ) {

          if ( err ) return mw.errorResponse( req, res, err );

          // shove it up the newsletter object

          build( model, req.agenda, campaign, function( err, newsletterData ) {

            if (err) return mw.errorResponse( req, res, err );

            newsletterData.type = 'html';

            mw.render( req, res, 'newsletter/show', newsletterData );

          });


        });

        

      });

    },


    newsletterShow: function( req, res ) {

      req.agenda.campaigns.get({uid: req.params.uid}, function ( err, campaign ) {

        if (err) return mw.errorResponse(req, res, err);

        campaign = req.agenda.campaigns.instance( campaign );

        build(model, req.agenda, campaign, function( err, newsletterData ) {

          if (err) return mw.errorResponse(req, res, err);

          newsletterData.type = 'html';

          mw.render(req, res, 'newsletter/show', newsletterData);

        });

      });

    },

    contactListNew: function( req, res ) {

      mw.render(req, res, 'newsletter/admin/contactListForm', lib.extend({
        uid: null,
        values: {},
        errors: {}
      }, _layoutData(req.agenda)));

    },

    contactListCreate: function( req, res ) {

      var values = req.body || {};

      req.agenda.contactLists.validateAndCreate(values, function ( err, result ) {

        if (err) return mw.errorResponse(req, res, err);

        if (result.errors) {

          var errors = lib.toUnderscore(result.errors);

          return mw.render(req, res, 'newsletter/admin/contactListForm', lib.extend({
            uid: null,
            values: values,
            errors: errors
          }, _layoutData(req.agenda)));

        }

        // everything went well if we are here

        if (values.emails.length) {

          req.agenda.contactLists.instance(result.object).contacts.validateAndCreateMultiple(values, function ( err, result) {

            if (err) return mw.errorResponse(req, res, err);

            return router.redirect(req, res, 'newsletterIndex');

          });

        } else {

          return router.redirect(req, res, 'newsletterIndex');

        }

      });

    },

    contactListShow: function( req, res ) {

      req.agenda.contactLists.get({uid: req.params.uid}, function ( err, contactList ) {

        if (err) return mw.errorResponse(req, res, err);

        req.agenda.contactLists.instance(contactList).contacts.list(function ( err, contacts ) {

          if (err) return mw.errorResponse(req, res, err);

          mw.render(req, res, 'newsletter/admin/contactListShow', lib.extend(contactList,{
            values: {},
            errors: {},
            contacts: contacts
          },
          _layoutData(req.agenda),
          _pager(1,0,'contactListShow', {})
        ));

        });

      });

    },

    contactListRemove: function( req, res ) {

      req.agenda.contactLists.get({uid: req.params.uid}, function ( err, result ) {

        if (err) return mw.errorResponse(req, res, err);

        req.agenda.contactLists.instance(result).remove(function ( err, result ) {

          if (err) return mw.errorResponse(req, res, err);

          return router.redirect(req, res, 'newsletterIndex');

        });

      });

    },

    contactsAdd: function( req, res ) {

      var values = req.body || {};

      req.agenda.contactLists.get({uid: req.params.uid}, function ( err, contactList ) {

        if (err) return mw.errorResponse(req, res, err);

        req.agenda.contactLists.instance(contactList).contacts.validateAndCreateMultiple(values, function ( err, result ) {

          if (err) return mw.errorResponse(req, res, err);

          if (result.success) {

            return router.redirect(req, res, 'contactListShow', {uid: req.params.uid});

          } else {

            req.agenda.contactLists.instance(contactList).contacts.list(function ( err, contacts ) {

              if (err) return mw.errorResponse(req, res, err);

              mw.render(req, res, 'newsletter/admin/contactListShow', lib.extend(contactList,{
                values: values,
                errors: result.errors,
                contacts: contacts
              },
                _layoutData(req.agenda),
                _pager(1,0,'contactListShow', {})
              ));

            });

            

          }

        });

      });

    },

    contactRemove: function( req, res ) {

      req.agenda.contactLists.get({ uid: req.params.uid }, function ( err, contactList ) {

        if (err) return mw.errorResponse(req, res, err);

        req.agenda.contactLists.instance(contactList).contacts.get({email: req.params.email}, function ( err, contact ) {

          if (err) return mw.errorResponse(req, res, err);

          req.agenda.contactLists.instance(contactList).contacts.instance(contact).remove(function ( err, result ) {

            if (err) return mw.errorResponse(req, res, err);

            return router.redirect(req, res, 'contactListShow', {uid: req.params.uid});

          });

        });

      });

    }

  }; // end of controllers

},


_processCampaignSave = function( req, cb, formCb ) {

  var values = req.body || {},

  uid = req.params.uid?req.params.uid:null;

  return function ( err, results ) {

    if ( err ) cb( err );

    var contactLists = results[0];

    // load campaign model validators

    req.agenda.campaigns[uid ? 'validateAndUpdate' : 'validateAndCreate'](values, { uid : uid }, function ( err, result ) {

      if ( err ) return cb( err );

      if ( !result.errors ) {

        // if no contact list was associated, scram.
        
        if (!values.list) return cb( null, result );

        // associate contact list

        return req.agenda.campaigns.instance(result.object).setContactList( lib.getByAttr(contactLists, { uid: parseFloat(values.list) } ), function( err ) {

          if ( err ) return cb( err );

          return cb( null, result );

        });

      }

      formCb( lib.toUnderscore(result.errors), values, contactLists );

    });

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

},


_pager = function( currentPage, totalItems, routeName, values, itemsPerPage) {

  itemsPerPage = itemsPerPage || 15;

  return {
    pager: {
      current: currentPage,
      total: totalItems,
      values: values,
      perPage: itemsPerPage
    }
  };

};