/**
 * load libraries
 */

var debug = require( 'debug' ),

log = debug( 'newsletter' ),

express = require( 'express' ),

bodyParser = require( 'body-parser' ),

cibulModel = require( 'cibulModel/lib/cibulModel' ),

mwLib = require( '../middleware' ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib.js' ), 

router = require( '../router.js' ),

build = require( './build' );


module.exports = function( base, config ) {

  log('loading newsletter module');


  // load app dependencies

  var app = express(),

  model = cibulModel( config.db, config.redis ),

  mw = mwLib( model, router, config );

  app.use( bodyParser.urlencoded( { extended: true } ) );

  app.set( 'base', base );

  app.set( 'name', 'newsletter' );

  app.set( 'perPage', 20 );


  // systematic module checks and loads

  app.param( 'slug', mw.loadAgenda );

  app.all( base + '*', router.loadUrlGen( app ), mw.flashSetter, mw.loadSession, mw.requireLogged, mw.checkCredential( model, 'newsletters' ) );


  // load module controllers

  router.loadRoutes( app, controllers( app, model, mw ) );

  return app;

};


var controllers = function( app, model, mw ) {

  var generic = require( './generic' )( model ),

  map = function() {

    return {
      newsletterIndex: [ 'get', index, '' ],
      campaignNew: [ 'get', campaignNew, '/campaigns/new' ],
      campaignCreate: [ 'post', campaignCreate, '/campaigns' ],
      campaignRemove: [ 'get', campaignRemove, '/campaigns/:uid/remove' ],
      campaignEdit: [ 'get', campaignEdit, '/campaigns/:uid/edit' ],
      campaignUpdate: [ 'post', campaignUpdate, '/campaigns/:uid/update' ],
      campaignLayoutEdit: [ 'get', campaignLayoutEdit, '/campaigns/:uid/layout' ],
      campaignLayoutUpdate: [ 'post', campaignLayoutUpdate, '/campaigns/:uid/layout' ],
      campaignFeaturedEdit: [ 'get', campaignFeaturedEdit, '/campaigns/:uid/featured' ],
      campaignFeaturedAdd: [ 'get', campaignFeaturedAdd, '/campaigns/:uid/featured/add/:eUid' ],
      campaignFeaturedRemove: [ 'get', campaignFeaturedRemove, '/campaigns/:uid/featured/remove/:eUid' ],
      campaignFeaturedClear: [ 'get', campaignFeaturedClear, '/campaigns/:uid/featured/clear' ],
      campaignComplete: [ 'post', campaignComplete, '/campaigns/:uid/complete' ],
      newsletterPreview: [ 'get', newsletterPreview, '/campaigns/:uid/preview' ],
      contactListNew: [ 'get', contactListNew, '/contactlists/new' ],
      contactListCreate: [ 'post', contactListCreate, '/contactlists' ],
      contactListShow: [ 'get', contactListShow, '/contactlists/:uid' ],
      contactListRemove: [ 'get', contactListRemove, '/contactlists/:uid/remove' ],
      contactsAdd: [ 'post', contactsAdd, '/contactlists/:uid/contacts' ],
      contactRemove: [ 'get', contactRemove, '/contactlists/:uid/contacts/:email/remove' ],
      newsletterIndexRedirect: [ 'get', indexRedirect, '/campaigns' ]
    };

  },


  index = function( req, res ) {

    log( 'received index request for agenda "%s"', req.agenda.title );

    wn.call( async.parallel, [

      req.agenda.campaigns.list,
      req.agenda.contactLists.list

    ])

    .spread( function( campaigns, contactLists ) {

      mw.render( req, res, 'newsletter/admin/index', lib.extend({
        campaigns: campaigns,
        contactLists: contactLists,
      }, _layoutData( req.agenda )));

    })

    .catch( _error( req, res ) );

  },


  indexRedirect = function( req, res ) {

    return router.redirect( req, res, 'newsletterIndex' );

  },


  campaignNew = function( req, res ) {

    wn.call( req.agenda.contactLists.list )

    .then( function( contactLists ) {

      mw.render( req, res, 'newsletter/admin/campaignForm', lib.extend({
        uid: null,
        contactLists: contactLists,
        values: {}, errors: {},
        isNew: true
      }, _layoutData(req.agenda)) );

    })

    .catch( _error( req, res ) );

  },


  campaignCreate = function( req, res ) {

    async.parallel([

      req.agenda.contactLists.list

    ], _processCampaignSave(req, function( err, result ) {

      // save was successful... or crashed altogether

      if ( err ) return _error( req, res )( err );

      router.redirect(req, res, 'campaignLayoutEdit', { uid: result.object.uid });

    }, function( err, result, values, errors, contactLists ) {

      if ( err ) return _error( req, res )( err );

      // ... some things are missing or wrong

      req.agenda.campaigns.instance( result.object ).getIsNew(function( err, isNew ) {

        if ( err ) return _error( req, res )( err );

        mw.render( req, res, 'newsletter/admin/campaignForm', lib.extend({
          isNew: isNew,
          uid: null,
          contactLists: contactLists,
          values: values,
          errors: errors
        }, _layoutData( req.agenda )));

      });

    }));

  },


  campaignRemove = function( req, res ) {

    wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

    .then( function( campaign ) {

      return wn.call( req.agenda.campaigns.instance( campaign ).remove );

    } )

    .then( function() {

      router.redirect( req, res, 'newsletterIndex' );

    } )

    .catch( _error( req, res ) );

  },


  campaignEdit = function( req, res ) {

    var values = {}, campaign, contactLists;

    wn.call( async.parallel, [

      req.agenda.contactLists.list,
      async.apply( req.agenda.campaigns.get, { uid: req.params.uid } )

    ])

    .spread( function( cl, c ) {

      if ( !c ) throw { code: 404, message: 'campaign does not exist' };

      campaign = req.agenda.campaigns.instance( c );

      contactLists = cl;

      values = campaign.getFormValues();

      return wn.call( campaign.getIsNew );

    })

    .then( function( isNew ) {

      if ( campaign.contactListId ) { // form matches contact list by uid

        values.list = lib.getByAttr( contactLists, { id: campaign.contactListId }).uid;

      }

      mw.render( req, res, 'newsletter/admin/campaignForm', lib.extend({
        uid: req.params.uid,
        contactLists: contactLists,
        values: values,
        errors: {},
        isNew: isNew
      }, _layoutData( req.agenda )) );

    })

    .catch( _error( req, res ) );

  },


  /**
   * update campaign general settings
   */

  campaignUpdate = function( req, res ) {

    async.parallel([

      req.agenda.contactLists.list

    ], _processCampaignSave(req, function( err, result ) {

      // save was successful... or crashed altogether

      if ( err ) return _error( req, res )( err );

      var campaign = req.agenda.campaigns.instance( result.object );

      campaign.getIsNew(function( err, isNew ) {

        if ( err ) return _error( req, res )( err );

        if ( !isNew ) {

          campaign.refreshScheduledAt(function( err, scheduledAt ) {

            return router.redirect(req, res, 'newsletterIndex', {}, 'campaign updated' );

          });

        } else {

          return router.redirect(req, res, 'campaignLayoutEdit', { uid: result.object.uid });

        }

      });

    }, function( err, result, values, errors, contactLists ) {

      if ( err ) return _error( req, res )( err );

      // ... some things are missing or wrong

      req.agenda.campaigns.get({ uid: req.params.uid }, function( err, campaign ) {

        if ( err ) return _error( req, res )( err );

        req.agenda.campaigns.instance( campaign ).getIsNew(function( err, isNew ) {

          if ( err ) return _error( req, res )( err );

          mw.render( req, res, 'newsletter/admin/campaignForm', lib.extend({
            isNew: isNew,
            uid: req.params.uid,
            contactLists: contactLists,
            values: values,
            errors: errors
          }, _layoutData(req.agenda)) );

        });

      });

    }));

  },


  campaignLayoutEdit = function( req, res ) {

    req.agenda.campaigns.get({ uid: req.params.uid }, function( err, campaign ) {

      if ( err ) return _error( req, res )( err );

      async.series([
        async.apply( req.agenda.categories.list ),
        async.apply( req.agenda.getDepartments ),
        async.apply( req.agenda.getRegions ),
        async.apply( req.agenda.getCities )
      ], function( err, results ) {

        if ( err ) return _error( req, res )( err );

        req.agenda.campaigns.instance( campaign ).getLayoutFormValues( function( err, values ) {

          if ( err ) return _error( req, res )( err );

          mw.render( req, res, 'newsletter/admin/campaignLayoutForm', lib.extend({
            uid: req.params.uid,
            type: 'manual',
            categories: results[0],
            departments: results[1],
            regions: results[2],
            cities: results[3],
            values: values,
            filters: req.query.filters?req.query.filters:{},
            errors: {}
          }, _layoutData(req.agenda)));

        });

      });

    });

  },


  campaignLayoutUpdate = function( req, res ) {

    var campaign;

    wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

    .then( function( c ) {

      campaign = req.agenda.campaigns.instance( c );

      return wn.call( _processCampaignLayout, campaign, req.body || {} );

    })

    .then( function() {

      log('campaign instance updated, building newsletter data');

      return wn.call( build, model, req.agenda, campaign );

    })

    .then( function( newsletterData ) {

      newsletterData.type = 'html';

      mw.render( req, res, 'newsletter/show', newsletterData );

    })

    .catch( _error( req, res ) );

  },


  campaignFeaturedEdit = function( req, res ) {

    var perPage = req.xhr ? 20 : app.get( 'perPage' );

    wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

    .then( function( campaign ) {

      campaign = req.agenda.campaigns.instance( campaign );

      return wn.call( async.parallel, [
        async.apply( campaign.events.total, { filters: req.query.filters }),
        async.apply( campaign.events.list, { filters: req.query.filters, page: req.query.page, limit: perPage } )
      ] );

    })

    .spread( function( total, eventList ) {

      eventList.map(function( e ) {

        var title = model.events().instance( e ).getTitle();

        e.title = title;
        
      });

      mw.render( req, res, 'newsletter/admin/campaignFeaturedForm', lib.extend({
        filters: req.query.filters || {},
        events: eventList,
        uid: req.params.uid
      }, 
      _pager( req, 'campaignFeaturedEdit', perPage, total ),
      _layoutData( req.agenda )));

    })

    .catch( _error( req, res ) );

  },


  campaignFeaturedAdd = function( req, res ) {

    wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

    .then( function( campaign ) {

      return wn.call( req.agenda.campaigns.instance( campaign ).addFeaturedEvent, { uid: req.params.eUid }, true );

    })

    .then( function() {

      return router.redirect(req, res, 'campaignFeaturedEdit', { uid: req.params.uid }, true );

    })

    .catch( _error( req, res ));

  },


  campaignFeaturedRemove = function( req, res ) {

    wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

    .then( function( campaign ) {

      return wn.call( req.agenda.campaigns.instance( campaign ).removeFeaturedEvent, { uid: req.params.eUid }, true );

    })

    .then( function() {

      return router.redirect(req, res, 'campaignFeaturedEdit', { uid: req.params.uid }, true );

    })

    .catch( _error( req, res ));

  },


  campaignFeaturedClear = function( req, res ) {

    wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

    .then( function( campaign ) {

      return wn.call( req.agenda.campaigns.instance( campaign ).clearFeaturedEvents, true );

    })

    .then( function() {

      return router.redirect(req, res, 'campaignFeaturedEdit', { uid: req.params.uid }, true );

    })

    .catch( _error( req, res ));

  },


  campaignComplete = function( req, res ) {

    var campaign;

    wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

    .then( function( campaignData ) {

      campaign = req.agenda.campaigns.instance( campaignData );


      return wn.call( _processCampaignLayout, campaign, req.body || {} );

    })

    .then( function() {

      return wn.call( campaign.setIsNew, false );

    })

    .then( function() {

      return wn.call( campaign.refreshScheduledAt );

    })

    .then( function() {

      return wn.call( campaign.save );

    })

    .then( function() {

      router.redirect(req, res, 'newsletterIndex');

    })

    .catch( _error( req, res ) );

  },


  newsletterPreview = function( req, res ) {

    wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

    .then(function( campaign ) {

      return wn.call( build, model, req.agenda, req.agenda.campaigns.instance( campaign ) );

    })

    .then(function( newsletterData ) {

      newsletterData.type = 'html';

      mw.render( req, res, 'newsletter/show', newsletterData );

    })

    .catch( _error( req, res ) );

  },


  contactListNew = function( req, res ) {

    mw.render( req, res, 'newsletter/admin/contactListForm', lib.extend({
      uid: null,
      values: {},
      errors: {}
    }, _layoutData( req.agenda )), true );

  },


  contactListCreate = function( req, res ) {

    var values = req.body || {};

    req.agenda.contactLists.validateAndCreate(values, function ( err, result ) {

      if ( err ) return _error( req, res )( err );

      if (result.errors) {

        var errors = lib.toUnderscore(result.errors);

        return mw.render(req, res, 'newsletter/admin/contactListForm', lib.extend({
          uid: null,
          values: values,
          errors: errors
        }, _layoutData(req.agenda)), true );

      }


      // everything went well if we are here

      if (values.emails.length) {

        req.agenda.contactLists.instance(result.object).contacts.validateAndCreateMultiple(values, function ( err, result) {

          if ( err ) return _error( req, res )( err );

          return router.redirect(req, res, 'newsletterIndex', {}, 'The contact list was created' );

        });

      } else {

        return router.redirect(req, res, 'newsletterIndex', {}, 'The contact list was created' );

      }

    });

  },


  contactListShow = function( req, res ) {

    async.waterfall([

      async.apply( req.agenda.contactLists.get, {uid: req.params.uid } ),

      function( contactList, wcb ) {

        contactList = req.agenda.contactLists.instance(contactList);

        contactList.contacts.total({ filters: req.query.filters },  function( err, total ) {

          if ( err ) return wcb( err );

          wcb( null, contactList, total );

        });

      },

      function( contactList, total, wcb ) {

        contactList.contacts.list( { filters: req.query.filters, page: req.query.page, limit: app.get('perPage') }, function( err, contacts ) {

          if ( err ) return wcb( err );

          wcb( null, contactList, total, contacts );

        });

      },

      function( contactList, total, contacts, wcb ) {

        mw.render(req, res, 'newsletter/admin/contactListShow', lib.extend(contactList, {
          values: {},
          errors: {},
          contacts: contacts
        },
        _layoutData(req.agenda),
        _pager( req, 'contactListShow', app.get( 'perPage' ), total )
        ), true );

      }

    ], function( err ) {

      if ( err ) mw.errorResponse(req, res, err);

    });

  },


  contactListRemove = function( req, res ) {

    req.agenda.contactLists.get({uid: req.params.uid}, function ( err, result ) {

      if ( err ) return _error( req, res )( err );

      req.agenda.contactLists.instance(result).remove(function ( err, result ) {

        if ( err ) return _error( req, res )( err );

        return router.redirect(req, res, 'newsletterIndex', true);

      });

    });

  },


  contactsAdd = function( req, res ) {

    var values = req.body || {};

    req.agenda.contactLists.get( { uid: req.params.uid }, function ( err, contactList ) {

      contactList = req.agenda.contactLists.instance( contactList );

      if ( err ) return _error( req, res )( err );

      req.agenda.contactLists.instance( contactList ).contacts.validateAndCreateMultiple( values, function ( err, result ) {

        if ( err ) return _error( req, res )( err );

        if (result.success) {

          return router.redirect(req, res, 'contactListShow', { uid: req.params.uid }, 'The contacts were added' );

        } else {

          async.series([

            async.apply( contactList.contacts.list, { page: req.query.page, limit: app.get('perPage') }),

            function( contacts, wcb ) {

              contactList.contacts.total(function( err, total ) {

                if ( err ) return _error( req, res )( err );

                wcb( null, total );

              });

            },

            function( contacts, total ) {

              mw.render(req, res, 'newsletter/admin/contactListShow', lib.extend(contactList,{
                values: values,
                errors: result.errors,
                contacts: contacts
              },
                _layoutData(req.agenda),
                _pager( req, 'contactListShow', app.get( 'perPage' ), total )
              ));

            }

          ], function( err ) {

            if ( err ) return _error( req, res )( err );

          });

        }

      });

    });

  },


  contactRemove = function( req, res ) {

    generic.contactRemove(req.agenda, req.params.uid, req.params.email, function( err, result ){

      if ( err ) return _error( req, res )( err );

      return router.redirect( req, res, 'contactListShow', { uid: req.params.uid }, 'The contact was removed' );

    });

  },


  _error = function( req, res ) {

    return function( err ) {

      if ( typeof err === 'string' ) err = { message: err };

      var link = false;

      if ( req.agenda ) {

        err.link = {
          uri: 'newsletterIndex',
          values: {},
          label: 'go back to newsletters index'
        };

      }

      mw.errorResponse( req, res, err );

    };

  };


  return map();

},


_processCampaignSave = function( req, cb, formCb ) {

  var values = req.body || {},

  uid = req.params.uid ? req.params.uid : null;

  return function ( err, results ) {

    if ( err ) cb( err );

    var contactLists = results[0];

    // load campaign model validators

    req.agenda.campaigns[uid ? 'validateAndUpdate' : 'validateAndCreate']( values, { uid : uid }, function ( err, result ) {

      if ( err ) return cb( err );

      // associate contact list

      var contactList = null;

      if ( !result.errors ) {
        
        if ( values.list ) contactList = lib.getByAttr(contactLists, { uid: parseFloat(values.list) } );

        return req.agenda.campaigns.instance(result.object).setContactList( contactList, function( err ) {

          if ( err ) return cb( err );

          return cb( null, result );

        });

      } else {

        formCb(null, result, values, lib.toUnderscore(result.errors), contactLists );

      }

    });

  };

},


_processCampaignLayout = function( campaign, values, cb ) {

  log( 'validate and clean submitted campaign values' );

  var filterValues = {};

  async.series([

    async.apply(campaign.setEdito, values.edito),

    async.apply(campaign.setSegmentation, values.segmentation),

    function ( scb ) { // load filters

      log( 'load and clean filters' );

      [ 'category', 'cities', 'departments', 'regions' ].forEach(function( filterName ) {

        // this will need to be in its own lib

        var value = values[filterName],

        clean;

        if ( !value ) return;

        if ( typeof value == 'object' ) {

          // assuming this is a check box

          clean = [];

          for ( var name in value ) {

            clean.push( name );

          }

        } else {

          clean = value;

        }

        filterValues[filterName] = clean;

      });

      log( 'filters clean, setting in campaign instance' );

      campaign.setFilters( filterValues, scb );

    }

  ], cb);

},


/**
 * prepare form for new campaign
 */

_layoutData = function( agenda ) {

  return {
    tab: 'newsletters',
    mainClass: 'newsletter',
    scriptsBase: '/js',
    head: {
      css: {
        main: '//d.cibul.net/css/compiled.css'
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

_pager = function( req, routeName, perPage, totalItems ) {

  return {
    pager: {
      base: { uid: req.params.uid },
      routeName: routeName,
      current: req.query.page || 1,
      total: totalItems,
      perPage: perPage
    }
  };

};