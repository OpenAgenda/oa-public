"use strict";

var modLib = require( '../lib/moduleLib' ),

log = require( 'logger' )( 'newsletter/back' ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ), 

cmn = require( '../lib/commons-app' ),

build = require( './build' ),

model = cmn.getCibulModel(),

generic = require( './generic' )( model ),

agendaSvc = require( '../services/agenda' ),

routes = {
  newsletterIndex: [ 'get', '', index ],
  campaignNew: [ 'get', '/campaigns/new', campaignNew ],
  campaignCreate: [ 'post', '/campaigns', campaignCreate ],
  campaignRemove: [ 'get', '/campaigns/:uid/remove', campaignRemove ],
  campaignEdit: [ 'get', '/campaigns/:uid/edit', campaignEdit ],
  campaignUpdate: [ 'post', '/campaigns/:uid/update', campaignUpdate ],
  campaignLayoutEdit: [ 'get', '/campaigns/:uid/layout', campaignLayoutEdit ],
  campaignLayoutUpdate: [ 'post', '/campaigns/:uid/layout', campaignLayoutUpdate ],
  campaignFeaturedEdit: [ 'get', '/campaigns/:uid/featured', campaignFeaturedEdit ],
  campaignFeaturedAdd: [ 'get', '/campaigns/:uid/featured/add/:eUid', campaignFeaturedAdd ],
  campaignFeaturedRemove: [ 'get', '/campaigns/:uid/featured/remove/:eUid', campaignFeaturedRemove ],
  campaignFeaturedClear: [ 'get', '/campaigns/:uid/featured/clear', campaignFeaturedClear ],
  campaignComplete: [ 'post', '/campaigns/:uid/complete', campaignComplete ],
  newsletterPreview: [ 'get', '/campaigns/:uid/preview', newsletterPreview ],
  contactListNew: [ 'get', '/contactlists/new', contactListNew ],
  contactListCreate: [ 'post', '/contactlists', contactListCreate ],
  contactListShow: [ 'get', '/contactlists/:uid', contactListShow ],
  contactListRemove: [ 'get', '/contactlists/:uid/remove', contactListRemove ],
  contactsAdd: [ 'post', '/contactlists/:uid/contacts', contactsAdd ],
  contactRemove: [ 'get', '/contactlists/:uid/contacts/:email/remove', contactRemove ],
  newsletterIndexRedirect: [ 'get', '/campaigns', indexRedirect ]
};


module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug' ),
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadBaseData( _layoutData ),
    cmn.requireLogged,
    cmn.checkCredential( 'newsletters' ),
    cmn.checkAdministrator()
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

};


/**
 * controllers
 */

function index( req, res ) {

  wn.call( async.parallel, [

    req.agenda.campaigns.list,
    req.agenda.contactLists.list

  ])

  .spread( function( campaigns, contactLists ) {

    cmn.render( req, res, 'newsletter/admin/index', {
      campaigns: campaigns,
      contactLists: contactLists
    });

  })

  .catch( _error( req, res ) );

}


function indexRedirect( req, res ) {

  return res.redirect( 302, req.genUrl( 'newsletterIndex', { slug: req.agenda.slug } ) );

}


function campaignNew( req, res ) {

  wn.call( req.agenda.contactLists.list )

  .then( function( contactLists ) {

    cmn.render( req, res, 'newsletter/admin/campaignForm', {
      uid: null,
      contactLists: contactLists,
      values: {}, errors: {},
      isNew: true
    } );

  })

  .catch( _error( req, res ) );

}


function campaignCreate( req, res ) {

  _processCampaignSubmit( req, res, null, 'campaignLayoutEdit' );

}


function campaignRemove( req, res ) {

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then( function( campaign ) {

    return wn.call( req.agenda.campaigns.instance( campaign ).remove );

  } )

  .then( function() {

    res.setFlash( req, 'The campaign was deleted' );

    res.redirect( 302, req.genUrl( 'newsletterIndex', { slug: req.agenda.slug } ) );

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

    cmn.render( req, res, 'newsletter/admin/campaignForm', {
      uid: req.params.uid,
      contactLists: contactLists,
      values: values,
      errors: {},
      isNew: isNew
    } );

  })

  .catch( _error( req, res ) );

}


/**
 * update campaign general settings
 */

function campaignUpdate( req, res ) {

  _processCampaignSubmit( req, res, req.params.uid, 'campaignEdit', 'campaign updated' );

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

        cmn.render( req, res, 'newsletter/admin/campaignLayoutForm', {
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
        } );

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

    req.log( 'debug', 'campaign instance updated, building newsletter data' );

    return wn.call( build, model, req.agenda, campaign );

  })

  .then( function( newsletterData ) {

    newsletterData.type = 'html';

    cmn.render( req, res, 'newsletter/show', newsletterData );

  })

  .catch( _error( req, res ) );

}


function campaignFeaturedEdit( req, res ) {

  var perPage = req.xhr ? 20 : perPage;

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then( function( c ) {

    var campaign = req.agenda.campaigns.instance( c );

    req.log( 'debug', 'filters set: %s', JSON.stringify( req.query.filters ) );

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
    _pager( req, 'campaignFeaturedEdit', perPage, total )));

  })

  .catch( _error( req, res ) );

}


function campaignFeaturedAdd( req, res ) {

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then( function( campaign ) {

    return wn.call( req.agenda.campaigns.instance( campaign ).addFeaturedEvent, { uid: req.params.eUid }, true );

  })

  .then( function() {

    res.redirect( 302, req.genUrl( 'campaignFeaturedEdit', { slug: req.agenda.slug, uid: req.params.uid }, true ) );

  })

  .catch( _error( req, res ));

}


function campaignFeaturedRemove( req, res ) {

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then( function( campaign ) {

    return wn.call( req.agenda.campaigns.instance( campaign ).removeFeaturedEvent, { uid: req.params.eUid }, true );

  })

  .then( function() {

    res.redirect( 302, req.genUrl( 'campaignFeaturedEdit', { slug: req.agenda.slug, uid: req.params.uid }, true ) );

  })

  .catch( _error( req, res ));

}


function campaignFeaturedClear( req, res ) {

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then( function( campaign ) {

    return wn.call( req.agenda.campaigns.instance( campaign ).clearFeaturedEvents, true );

  })

  .then( function() {

    return res.redirect( 302, req.genUrl( 'campaignFeaturedEdit', { slug: req.agenda.slug, uid: req.params.uid }, true ) );

  })

  .catch( _error( req, res ));

}


/**
 * save campaign configuration with layout updates
 */

function campaignComplete( req, res ) {

  var campaign;

  wn.call( req.agenda.campaigns.get, { uid: req.params.uid } )

  .then( function( campaignData ) {

    campaign = req.agenda.campaigns.instance( campaignData );

    return wn.call( _processCampaignLayout, campaign, req.body || {} );

  })

  .then(function() {

    return wn.call( build, model, req.agenda, campaign );

  })

  .then(function( newsletterData ) {

    return wn.call( campaign.setWarnings, newsletterData.warnings );

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

    res.setFlash( req, 'the campaign was updated' );

    res.redirect( 302, req.genUrl( 'newsletterIndex', { slug: req.agenda.slug } ) );

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

  cmn.render( req, res, 'newsletter/admin/contactListForm', {
    uid: null,
    values: {},
    errors: {}
  }, true );

}


function contactListCreate( req, res ) {

  var values = req.body || {};

  req.agenda.contactLists.validateAndCreate(values, function ( err, result ) {

    if ( err ) return _error( req, res )( err );

    if (result.errors) {

      var errors = lib.toUnderscore(result.errors);
      
      return cmn.render(req, res, 'newsletter/admin/contactListForm', {
        uid: null,
        values: values,
        errors: errors
      }, true );

    }


    // everything went well if we are here

    if (values.emails.length) {

      req.agenda.contactLists.instance(result.object).contacts.validateAndCreateMultiple(values, function ( err, result) {

        if ( err ) return _error( req, res )( err );

        res.setFlash( req, 'The contact list was created' );

        return res.redirect( 302, req.genUrl( 'newsletterIndex', { slug: req.agenda.slug } ) );

      });

    } else {

      res.setFlash( req, 'The contact list was created' );

      return res.redirect( 302, req.genUrl( 'newsletterIndex', { slug: req.agenda.slug } ) );

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

      contactList.contacts.list( { filters: req.query.filters, page: req.query.page, limit: perPage }, function( err, contacts ) {

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
      _pager( req, 'contactListShow', perPage, total )
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

    res.setFlash( req, 'The contact list was deleted' );

    res.redirect( 302, req.genUrl( 'newsletterIndex', { slug: req.agenda.slug } ) );

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

        res.setFlash( req, 'The contacts were added' );

        return res.redirect( 302, req.genUrl( 'contactListShow', {  slug: req.agenda.slug, uid: req.params.uid } ) );

      } else {

        async.series([

          async.apply( contactList.contacts.list, { page: req.query.page, limit: perPage }),

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
              _pager( req, 'contactListShow', perPage, total )
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

    res.setFlash( req, 'The contact was removed' );

    return res.redirect( 302, req.genUrl( 'contactListShow', { slug: req.agenda.slug, uid: req.params.uid } ) );

  });

}



/**
 * controller helpers
 */


function _error( req, res ) {

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

    cmn.errorResponse( req, res, err );

  };

}


/**
 * associate contact list with campaign
 */

function _associateContactList( campaign, contactLists, values, cb ) {

  var contactList;
      
  if ( values.list ) {

    contactList = lib.getByAttr( contactLists, { uid: parseFloat( values.list ) } );

  }

  campaign.setContactList( contactList, function( err ) {

    cb( err );

  } );

}



/**
 * process campaign submit for create or update
 */

function _processCampaignSubmit( req, res, uid, successRedirect, successMessage ) {

  log( 'processing campaign submit' );

  var values = req.body || {},

  contactLists,

  campaign;

  wn.call( req.agenda.contactLists.list )

  .then( function( cls ) {

    log( 'agenda contact lists are loaded, validating campaign data' );

    contactLists = cls;

    return wn.call( req.agenda.campaigns[ uid ? 'validateAndUpdate' : 'validateAndCreate' ], values, { uid : uid } );

  })

  // if campaign was created, associate submitted list selection

  .then( function( validationResult ) {

    if ( !validationResult.errors ) {

      log( 'campaign data is valid, campaign was ' + ( uid ? 'updated' : 'created' ) );

      campaign = req.agenda.campaigns.instance( validationResult.object );

      // the campaign was valid and is now created, associate contact list

      return wn.call( _associateContactList, campaign, contactLists, values );

    }

    log( 'campaign data is not valid.' );

    return validationResult.errors;

  })

  .then( function( errors ) {

    // load campaign instance if not already done and available

    if ( !campaign && uid ) {

      return wn.call( function( cb ) {
        
        req.agenda.campaigns.get( { uid : uid }, function( err, c ) {

          if ( err ) return cb( err );

          campaign = req.agenda.campaigns.instance( c );

          cb( null, errors );

        });

      } );

    } else {

      return errors;

    }

  })

  .then( function( errors ) {

    campaign.getIsNew( function( err, isNew ) {

      if ( !errors ) {

        if ( !isNew ) {

          log( 'campaign is not new, schedule date needs refreshing' );

          campaign.refreshScheduledAt(function( err, scheduledAt ) {

            log( 'campaign scheduling was refreshed, redirecting to %s', successRedirect );

            res.setFlash( req, successMessage );

            res.redirect( 302, req.genUrl( successRedirect, { slug: req.agenda.slug, uid : campaign.uid } ) );

          });

        } else {

          log( 'campaign is new, redirecting to %s', successRedirect );

          res.setFlash( req, successMessage );

          res.redirect( 302, req.genUrl( successRedirect, { slug: req.agenda.slug, uid : campaign.uid } ) );

        }

      } else {

        if ( err ) throw err;

        cmn.render( req, res, 'newsletter/admin/campaignForm', {
          isNew: isNew,
          uid: uid,
          contactLists: contactLists,
          values: values,
          errors: errors
        } );

      }

    });

  })

  .catch( _error( req, res ) );

}




function _processCampaignLayout( campaign, values, cb ) {

  log( 'debug', 'validate and clean submitted campaign values' );

  var filterValues = {};

  async.series([

    async.apply( campaign.setEdito, values.edito ),

    async.apply( campaign.setSegmentation, values.segmentation ),

    function ( scb ) { // load filters or deactivate

      if ( campaign.isManual() && values.exclude_selection ) {

        log( 'do not use selection' );

        campaign.setSelectionEnable( false, scb );

      } else {

        campaign.setSelectionEnable( true );

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

    }

  ], cb);

}


/**
 * prepare form for new campaign
 */

function _layoutData( req, res ) {

  return {
    tab: 'newsletters',
    mainClass: 'newsletter',
    agenda: {
      slug: req.agenda.slug,
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
      image: req.agenda.getImage( false )
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