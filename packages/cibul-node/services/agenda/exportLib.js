"use strict";

var svc,

utils = require( 'utils' ),

async = require( 'async' ),

genUrl = require( '../genUrl' ),

agendaTags = require( 'agenda-tags' ),

agendaCategories = require( 'agenda-categories' ),

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

      event.getState( ( err, state ) => {

        if ( err ) return wcb( err );

        toDecorate.state = state;

        wcb();

      });

    },

    wcb => {

      event.getFeatured( ( err, isFeatured ) => {

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

      customFieldsGetter( event, params.lang, ( err, custom ) => {

        if ( err ) return wcb( err );

        toDecorate.customValues = {};

        custom.forEach( ( v ) => {

          if ( v.fieldType == 'image' ) {

            if ( v.value ) {

              toDecorate.customValues[ v.name ] = config.aws.imageBucketPath + v.value;

            }

          } else {

            toDecorate.customValues[ v.name ] = v.value;

          }

        } );

        toDecorate.custom = custom;

        toDecorate.customLabels = agenda.getCustomFieldsLabels( event.getCurrentLanguage() );

        wcb();

      } );

    },

    wcb => {

      event.getAgendaCategory( agenda.id, ( err, category ) => {

        if ( err ) return wcb( err );

        toDecorate.category = category || null;

        wcb();

      });

    },

    wcb => {

      event.getAgendaTags( agenda.id, ( err, tags ) => {

        if ( err ) return wcb( err );

        toDecorate.tags = tags;

        wcb();

      } );

    },

    wcb => {

      toDecorate.tagGroups = [];

      if ( !toDecorate.tags.length ) return wcb();

      let tagSlugs = toDecorate.tags.map( t => t.slug );

      agendaTags.get( agenda.id, ( err, tagSet ) => {

        if ( err ) return wcb( err );

        toDecorate.tagGroups = ( tagSet ? tagSet.groups : [] ).filter( g => {

          // keep groups containing tags used by event
          return g.tags.filter( t => tagSlugs.indexOf( t.slug ) ).length;

        } ).map( g => {

          return {
            name: g.name,
            tags: g.tags.filter( t => tagSlugs.indexOf( t.slug ) !== -1 ).map( t => { return { label: t.label, slug: t.slug } } )
          }

        } );

        console.log( JSON.stringify( toDecorate.tagGroups ) );

        wcb();

      } );

    }

  ], function( err ) {

    if ( err ) return cb( err );

    cb( null, toDecorate );

  });

}

function decorateEvents( agenda, events, toDecorate, options, cb ) {

  var i = 0;

  async.eachSeries( events, ( event, ecb ) => {

    decorateEvent( agenda, event, toDecorate[ i++ ], options, ecb );

  }, cb );

}