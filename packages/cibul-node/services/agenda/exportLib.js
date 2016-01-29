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

    // if private data requested, add state info
    wcb => {

      if ( !params.includePrivateData ) return wcb();

      event.getState( ( err, state ) => {

        if ( err ) return wcb( err );

        toDecorate.state = state;

        wcb();

      });

    },

    // add featured
    wcb => {

      event.getFeatured( ( err, isFeatured ) => {

        if ( err ) return wcb( err );

        toDecorate.featured = isFeatured;

        wcb();

      });

    },

    // add custom fields
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

    // add contributor info
    wcb => {

      if ( !params.includePrivateData ) return wcb();

      event.getContributorInfo( agenda.id, ( err, contributorInfo ) => {

        if ( err ) return wcb( err );

        toDecorate.contributor = contributorInfo || null;

        wcb();

      } );

    },

    // add category
    wcb => {

      // if category is already present, no
      // need to fetch again
      if ( toDecorate.category ) return wcb();

      event.getAgendaCategory( agenda.id, ( err, category ) => {

        if ( err ) return wcb( err );

        toDecorate.category = category || null;

        wcb();

      });

    },

    // add tags
    wcb => {

      // if tags are already loaded
      // no need to fetch again
      if ( toDecorate.tags ) return wcb();

      event.getAgendaTags( agenda.id, ( err, tags ) => {

        if ( err ) return wcb( err );

        toDecorate.tags = tags;

        wcb();

      } );

    },

    // add tag groups
    wcb => {

      toDecorate.tagGroups = [];

      let tagSlugs = [];

      if ( typeof toDecorate.tags == 'string' ) {

        tagSlugs = [ toDecorate.tags ];

      } else if ( toDecorate.tags ) {

        tagSlugs = toDecorate.tags.map( t => t.slug );

      }

      if ( !tagSlugs || !tagSlugs.length ) return wcb();

      agendaTags.get( agenda.id, ( err, tagSet ) => {

        if ( err ) return wcb( err );

        toDecorate.tagGroups = ( tagSet ? tagSet.groups : [] ).filter( g => {

          // keep groups containing tags used by event
          return g.tags.filter( t => tagSlugs.indexOf( t.slug ) ).length;

        } ).map( g => {

          // keep group tags used by event
          return {
            name: g.name,
            tags: g.tags.filter( t => tagSlugs.indexOf( t.slug ) !== -1 ).map( t => { return { label: t.label, slug: t.slug } } )
          }

        } ).filter( g => {

          // remove empty groups
          return g.tags.length;

        } )

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