"use strict";

var svc, middlewares,

utils = require( '../../lib/utils' ),

async = require( 'async' );

module.exports = function( service ) {

  svc = service;

  return {
    decorateEvents: decorateEvents,
    mw: middlewares
  }

}


function decorateEvents( agenda, events, toDecorate, options, cb ) {

  var params = utils.extend( {
    genUrl: function() {},
    includePrivateData: false
  }, options ),

  i = 0;

  async.eachSeries( events, function( event, ecb ) {

    toDecorate[ i ].canonicalUrl = params.genUrl( 'agendaEventShow', { 
      slug: agenda.slug,
      eventSlug: event.slug
    }, { protocol: 'https://' } );

    if ( params.includePrivateData ) {

      toDecorate[ i ].isPublished = event.isPublished;
      toDecorate[ i ].isDraft = event.isDraft;

    }

    async.waterfall( [

      function( wcb ) {

        var customFieldsGetter = agenda.getEventPublicCustomFields;

        if ( params.includePrivateData ) {

          customFieldsGetter = agenda.getEventCustomFields;

        }

        customFieldsGetter( event, function( err, values ) {

          if ( err ) return wcb( err );

          toDecorate[ i ].custom = values;

          wcb();

        } );

      },
      
      function( wcb ) {

        event.getAgendaCategory( agenda.id, function( err, category ) {

          if ( err ) return wcb( err );

          toDecorate[ i ].category = category || null;

          wcb();

        });

      },
      function( wcb ) {

        event.getAgendaTags( agenda.id, function( err, tags ) {

          if ( err ) return wcb( err );

          toDecorate[ i ].tags = tags;

          wcb();

        });

      }
    ], function( err ) {

      i++;

      ecb();

    });

  }, cb );

}