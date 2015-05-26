"use strict";

var svc,

utils = require( '../../lib/utils' ),

async = require( 'async' );

module.exports = function( service ) {

  svc = service;

  return {
    decorateEvents: decorateEvents
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

    async.waterfall( [

      function( wcb ) {

        event.getTimings( function( err, timings ) {

          if ( err ) return wcb( err );

          var t;

          utils.extend( toDecorate[ i ], {
            firstDate: null,
            firstTimeStart: null,
            firstTimeEnd: null
          } );

          if ( timings.length ) {

            t = {
              start: new Date( timings[ 0 ].start ),
              end: new Date( timings[ 0 ].end )
            };

            utils.extend( toDecorate[ i ], {
              firstDate: _stringifyDate( t.start ),
              firstTimeStart: _fZ( t.start.getUTCHours() ) + ':' + _fZ( t.start.getMinutes() ),
              firstTimeEnd: _fZ( t.end.getUTCHours() ) + ':' + _fZ( t.end.getMinutes() )
            });

          }

          wcb();

        });

      },

      function( wcb ) {

        if ( !params.includePrivateData ) return wcb();

        event.getState( function( err, state ) {

          if ( err ) return wcb( err );

          toDecorate[ i ].state = state;

          wcb();

        });

      },

      function( wcb ) {

        event.getFeatured( function( err, isFeatured ) {

          if ( err ) return wcb( err );

          toDecorate[ i ].featured = isFeatured;

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


function _stringifyDate( d ) {

  if ( typeof d == 'string' ) d = new Date( d );

  return [ d.getFullYear(), _fZ( d.getMonth() + 1 ), _fZ( d.getDate() ) ].join( '-' );

}

function _fZ( n ) {

  return (n>9?'':'0') + n;

};