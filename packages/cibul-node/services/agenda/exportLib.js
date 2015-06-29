"use strict";

var svc,

utils = require( '../../lib/utils' ),

async = require( 'async' ),

genUrl = require( '../genUrl' );

module.exports = function( service ) {

  svc = service;

  return {
    decorateEvents: decorateEvents,
    decorateEvent: decorateEvent
  }

}


function decorateEvent( agenda, event, clean, options, cb ) {

  var params = utils.extend( {
    includePrivateData: false
  }, options );

  clean.canonicalUrl = genUrl( 'agendaEventShow', { 
    slug: agenda.slug,
    eventSlug: event.slug
  }, { protocol: 'https://' } );

  async.waterfall( [

    function( wcb ) {

      if ( !params.includePrivateData ) return wcb();

      event.getState( function( err, state ) {

        if ( err ) return wcb( err );

        clean.state = state;

        wcb();

      });

    },

    function( wcb ) {

      event.getFeatured( function( err, isFeatured ) {

        if ( err ) return wcb( err );

        clean.featured = isFeatured;

        wcb();

      });

    },

    function( wcb ) {

      var customFieldsGetter = agenda.getEventPublicCustomFields;

      if ( params.includePrivateData ) {

        customFieldsGetter = agenda.getEventCustomFields;

      }

      customFieldsGetter( event, function( err, values ) {

        if ( err ) return wcb( err );

        clean.custom = values;

        wcb();

      } );

    },

    function( wcb ) {

      event.getAgendaCategory( agenda.id, function( err, category ) {

        if ( err ) return wcb( err );

        clean.category = category || null;

        wcb();

      });

    },

    function( wcb ) {

      event.getAgendaTags( agenda.id, function( err, tags ) {

        if ( err ) return wcb( err );

        clean.tags = tags;

        wcb();

      });

    }

  ], function( err ) {

    if ( err ) return cb( err );

    cb( null, clean );

  });

}

function decorateEvents( agenda, events, toDecorate, options, cb ) {

  var i = 0;

  async.eachSeries( events, function( event, ecb ) {

    decorateEvent( agenda, event, toDecorate[ i++ ], options, ecb );

  }, cb );

}