/**
 * load libraries and define app module routes
 */

var appName = 'newsletter/back',

exposed = {
  load: load
},

routes = {
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
},

log = require( '../lib/logger' )( appName ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ), 

cmn = require( '../lib/commons-app' ),

build = require( './build' ),

app,

path,

model = cmn.getCibulModel(),

generic = require( './generic' )( model );


function init( p ) {

  log( 'initing' );

  path = p;

  cmn.registerRoutes( appName, path, routes);

  return exposed;

}


function load( main ) {

  if ( app ) {

    log( 'this app has already been loaded');

    return;

  }

  log( 'loading' );

  app = cmn.loadApp( main, path, appName );

  app.set( 'perPage', 20 );

  app.use( require( 'body-parser' ).urlencoded( { extended: true } ) );

  app.param( 'slug', cmn.loadAgenda );

  cmn.loadRoutes( app, routes, [
    cmn.urlGenSetter( appName, path ),
    cmn.flashSetter,
    cmn.loadSession,
    cmn.requireLogged,
    cmn.checkCredential( 'newsletters' )
  ] );

  return exposed;

}


/**
 * controllers
 */

function index( req, res ) {

  log( 'received index request for agenda "%s"', req.agenda.title );

  wn.call( async.parallel, [

    req.agenda.campaigns.list,
    req.agenda.contactLists.list

  ])

  .spread( function( campaigns, contactLists ) {

    cmn.render( req, res, 'newsletter/admin/index', lib.extend({
      campaigns: campaigns,
      contactLists: contactLists
    }, _layoutData( req.agenda )));

  })

  .catch( _error( req, res ) );

}


function indexRedirect( req, res ) {

  return cmn.redirect( req, res, 'newsletterIndex' );

}


function campaignNew( req, res ) {

  wn.call( req.agenda.contactLists.list )

  .then( function( contactLists ) {

    cmn.render( req, res, 'newsletter/admin/campaignForm', lib.extend({
      uid: null,
      contactLists: contactLists,
      values: {}, errors: {},
      isNew: true
    }, _layoutData(req.agenda)) );

  })

  .catch( _error( req, res ) );

}


function campaignCreate( req, res ) {

  async.parallel([

    req.agenda.contactLists.list

  ], _processCampaignSave(req, function( err, result ) {

    // save was successful... or crashed altogether

    if ( err ) return _error( req, res )( err );

    cmn.redirect(req, res, 'campaignLayoutEdit', { uid: result.object.uid });

  }, function( err, result, values, errors, contactLists ) {

    if ( err ) return _error( req, res )( err );

    // ... some things are missing or wrong

    req.agenda.campaigns.instance( result.object ).getIsNew(function( err, isNew ) {

      if ( err ) return _error( req, res )( err );

      cmn.render( req, res, 'newsletter/admin/campaignForm', lib.extend({
        isNew: isNew,
        uid: null,
        contactLists: contactLists,
        values: values,
        errors: errors
      }, _layoutData( req.agenda )));

    });

  }));

}


function campaignRemove( req, res ) {

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then( function( campaign ) {

    return wn.call( req.agenda.campaigns.instance( campaign ).remove );

  } )

  .then( function() {

    cmn.redirect( req, res, 'newsletterIndex', {}, 'The campaign was deleted' );

  } )

  .catch( _error( req, res ) );

}


function campaignEdit( req, res ) {

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

    cmn.render( req, res, 'newsletter/admin/campaignForm', lib.extend({
      uid: req.params.uid,
      contactLists: contactLists,
      values: values,
      errors: {},
      isNew: isNew
    }, _layoutData( req.agenda )) );

  })

  .catch( _error( req, res ) );

}


/**
 * update campaign general settings
 */

function campaignUpdate( req, res ) {

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

          return cmn.redirect(req, res, 'newsletterIndex', {}, 'campaign updated' );

        });

      } else {

        return cmn.redirect(req, res, 'campaignLayoutEdit', { uid: result.object.uid });

      }

    });

  }, function( err, result, values, errors, contactLists ) {

    if ( err ) return _error( req, res )( err );

    // ... some things are missing or wrong

    req.agenda.campaigns.get({ uid: req.params.uid }, function( err, campaign ) {

      if ( err ) return _error( req, res )( err );

      req.agenda.campaigns.instance( campaign ).getIsNew(function( err, isNew ) {

        if ( err ) return _error( req, res )( err );

        cmn.render( req, res, 'newsletter/admin/campaignForm', lib.extend({
          isNew: isNew,
          uid: req.params.uid,
          contactLists: contactLists,
          values: values,
          errors: errors
        }, _layoutData(req.agenda)) );

      });

    });

  }));

}


function campaignLayoutEdit( req, res ) {

  var campaign;

  req.agenda.campaigns.get({ uid: req.params.uid }, function( err, c ) {

    campaign = req.agenda.campaigns.instance( c );

    if ( err ) return _error( req, res )( err );

    async.series([
      async.apply( req.agenda.categories.list ),
      async.apply( req.agenda.getDepartments ),
      async.apply( req.agenda.getRegions ),
      async.apply( req.agenda.getCities )
    ], function( err, results ) {

      if ( err ) return _error( req, res )( err );

      campaign.getLayoutFormValues( function( err, values ) {

        if ( err ) return _error( req, res )( err );

        cmn.render( req, res, 'newsletter/admin/campaignLayoutForm', lib.extend({
          title: campaign.title,
          uid: req.params.uid,
          isNew: campaign.getIsNew(),
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

}


function campaignLayoutUpdate( req, res ) {

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

    cmn.render( req, res, 'newsletter/show', newsletterData );

  })

  .catch( _error( req, res ) );

}


function campaignFeaturedEdit( req, res ) {

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

    cmn.render( req, res, 'newsletter/admin/campaignFeaturedForm', lib.extend({
      filters: req.query.filters || {},
      events: eventList,
      uid: req.params.uid
    }, 
    _pager( req, 'campaignFeaturedEdit', perPage, total ),
    _layoutData( req.agenda )));

  })

  .catch( _error( req, res ) );

}


function campaignFeaturedAdd( req, res ) {

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then( function( campaign ) {

    return wn.call( req.agenda.campaigns.instance( campaign ).addFeaturedEvent, { uid: req.params.eUid }, true );

  })

  .then( function() {

    return cmn.redirect(req, res, 'campaignFeaturedEdit', { uid: req.params.uid }, true );

  })

  .catch( _error( req, res ));

}


function campaignFeaturedRemove( req, res ) {

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then( function( campaign ) {

    return wn.call( req.agenda.campaigns.instance( campaign ).removeFeaturedEvent, { uid: req.params.eUid }, true );

  })

  .then( function() {

    return cmn.redirect(req, res, 'campaignFeaturedEdit', { uid: req.params.uid }, true );

  })

  .catch( _error( req, res ));

}


function campaignFeaturedClear( req, res ) {

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then( function( campaign ) {

    return wn.call( req.agenda.campaigns.instance( campaign ).clearFeaturedEvents, true );

  })

  .then( function() {

    return cmn.redirect(req, res, 'campaignFeaturedEdit', { uid: req.params.uid }, true );

  })

  .catch( _error( req, res ));

}


function campaignComplete( req, res ) {

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

    cmn.redirect( req, res, 'newsletterIndex' );

  })

  .catch( _error( req, res ) );

}


function newsletterPreview( req, res ) {

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then(function( campaign ) {

    return wn.call( build, model, req.agenda, req.agenda.campaigns.instance( campaign ) );

  })

  .then(function( newsletterData ) {

    newsletterData.type = 'html';

    cmn.render( req, res, 'newsletter/show', newsletterData );

  })

  .catch( _error( req, res ) );

}


function contactListNew( req, res ) {

  cmn.render( req, res, 'newsletter/admin/contactListForm', lib.extend({
    uid: null,
    values: {},
    errors: {}
  }, _layoutData( req.agenda )), true );

}


function contactListCreate( req, res ) {

  var values = req.body || {};

  req.agenda.contactLists.validateAndCreate(values, function ( err, result ) {

    if ( err ) return _error( req, res )( err );

    if (result.errors) {

      var errors = lib.toUnderscore(result.errors);

      return cmn.render(req, res, 'newsletter/admin/contactListForm', lib.extend({
        uid: null,
        values: values,
        errors: errors
      }, _layoutData(req.agenda)), true );

    }


    // everything went well if we are here

    if (values.emails.length) {

      req.agenda.contactLists.instance(result.object).contacts.validateAndCreateMultiple(values, function ( err, result) {

        if ( err ) return _error( req, res )( err );

        return cmn.redirect(req, res, 'newsletterIndex', {}, 'The contact list was created' );

      });

    } else {

      return cmn.redirect(req, res, 'newsletterIndex', {}, 'The contact list was created' );

    }

  });

}


function contactListShow( req, res ) {

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

      cmn.render(req, res, 'newsletter/admin/contactListShow', lib.extend(contactList, {
        values: {},
        errors: {},
        contacts: contacts
      },
      _layoutData(req.agenda),
      _pager( req, 'contactListShow', app.get( 'perPage' ), total )
      ), true );

    }

  ], function( err ) {

    if ( err ) _error( req, res )( err );

  });

}


function contactListRemove( req, res ) {

  wn.call( req.agenda.contactLists.get, { uid: req.params.uid } )

  .then( function( contactList ) {

    if ( !contactList ) throw { message : 'could not find contact list' };

    return wn.call( req.agenda.contactLists.instance( contactList ).remove );

  } )

  .then( function() {

    return cmn.redirect( req, res, 'newsletterIndex', true, 'The contact list was deleted' );

  })

  .catch( _error( req, res ) );

}


function contactsAdd( req, res ) {

  var values = req.body || {};

  req.agenda.contactLists.get( { uid: req.params.uid }, function ( err, contactList ) {

    contactList = req.agenda.contactLists.instance( contactList );

    if ( err ) return _error( req, res )( err );

    req.agenda.contactLists.instance( contactList ).contacts.validateAndCreateMultiple( values, function ( err, result ) {

      if ( err ) return _error( req, res )( err );

      if (result.success) {

        return cmn.redirect(req, res, 'contactListShow', { uid: req.params.uid }, 'The contacts were added' );

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

            cmn.render(req, res, 'newsletter/admin/contactListShow', lib.extend(contactList,{
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

}


function contactRemove( req, res ) {

  generic.contactRemove(req.agenda, req.params.uid, req.params.email, function( err, result ){

    if ( err ) return _error( req, res )( err );

    return cmn.redirect( req, res, 'contactListShow', { uid: req.params.uid }, 'The contact was removed' );

  });

}



/**
 * controller helpers
 */


function _error( req, res ) {

  return function( err ) {

    console.log( ' ==============' );
    console.log( err );
    console.log( ' ==============' );

    if ( typeof err === 'string' ) err = { message: err };

    var link = false;

    if ( req.agenda ) {

      err.link = {
        uri: 'newsletterIndex',
        values: {},
        label: 'go back to newsletters index'
      };

    }

    cmn.errorResponse( req, res, err );

  };

}


function _processCampaignSave( req, cb, formCb ) {

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

}


function _processCampaignLayout( campaign, values, cb ) {

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

}


/**
 * prepare form for new campaign
 */

function _layoutData( agenda ) {

  return {
    tab: 'newsletters',
    mainClass: 'newsletter',
    scriptsBase: '/js',
    head: {
      css: {
        main: '/css/compiled.css'
      }
    },
    agenda: {
      title: agenda.title,
      description: agenda.description,
      url: agenda.url,
      image: agenda.getImage( true )
    }
  };

}


function _pager( req, routeName, perPage, totalItems ) {

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

module.exports = init;