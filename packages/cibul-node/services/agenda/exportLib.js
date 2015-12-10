"use strict";

var svc,

utils = require( 'utils' ),

async = require( 'async' ),

genUrl = require( '../genUrl' ),

config = require( '../../config' );

module.exports = function( service ) {

  svc = service;

  return {
    decorateEvents: decorateEvents,
    decorateEvent: decorateEvent
  }

}


function decorateEvent( agenda, event, toDecorate, options, cb ) {

  var params = utils.extend( {
    includePrivateData: false,
    lang: false
  }, options );

  toDecorate.canonicalUrl = genUrl( 'agendaEventShow', { 
    slug: agenda.slug,
    eventSlug: event.slug
  }, { protocol: 'https://' } );

  async.waterfall( [

    wcb => {

      if ( !params.includePrivateData ) return wcb();

      event.getState( function( err, state ) {

        if ( err ) return wcb( err );

        toDecorate.state = state;

        wcb();

      });

    },

    wcb => {

      event.getFeatured( function( err, isFeatured ) {

        if ( err ) return wcb( err );

        toDecorate.featured = isFeatured;

        wcb();

      });

    },

    wcb => {

      var customFieldsGetter = agenda.getEventPublicCustomData;

      if ( params.includePrivateData ) {

        customFieldsGetter = agenda.getEventCustom;

      }

      customFieldsGetter( event, params.lang, function( err, custom ) {

        if ( err ) return wcb( err );

        toDecorate.customValues = {};

        custom.forEach( ( v ) => {

          if ( v.fieldType == 'image' ) {

            toDecorate.customValues[ v.name ] = config.aws.imageBucketPath + v.value;

          } else {

            toDecorate.customValues[ v.name ] = v.value;

          }

        } );

        toDecorate.custom = custom;

        toDecorate.customLabels = agenda.getCustomFieldsLabels( event.getCurrentLanguage() );

        wcb();

      } );

    },

    function( wcb ) {

      event.getAgendaCategory( agenda.id, function( err, category ) {

        if ( err ) return wcb( err );

        toDecorate.category = category || null;

        wcb();

      });

    },

    function( wcb ) {

      event.getAgendaTags( agenda.id, function( err, tags ) {

        if ( err ) return wcb( err );

        toDecorate.tags = tags;

        wcb();

      });

    }

  ], function( err ) {

    if ( err ) return cb( err );

    cb( null, toDecorate );

  });

}

function decorateEvents( agenda, events, toDecorate, options, cb ) {

  var i = 0;

  async.eachSeries( events, function( event, ecb ) {

    decorateEvent( agenda, event, toDecorate[ i++ ], options, ecb );

  }, cb );

}