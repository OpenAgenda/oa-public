"use strict";

var svc,

utils = require( 'utils' ),

async = require( 'async' ),

genUrl = require( '../genUrl' ),

agendaTags = require( 'agenda-tags' ),

agendaCategories = require( 'agenda-categories' ),

config = require( '../../config' ),

w = require( 'when' );

module.exports = function( service ) {

  svc = service;

  return {
    decorateEvents,
    decorateEvent
  }

}


function decorateEvents( agenda, events, toDecorate, options, cb ) {

  var i = 0;

  async.eachSeries( events, ( event, ecb ) => {

    decorateEvent( agenda, event, toDecorate[ i++ ], options, ecb );

  }, cb );

}


function decorateEvent( agenda, event, toDecorate, options, cb ) {

  toDecorate.canonicalUrl = genUrl( 'agendaEventShow', { 
    slug: agenda.slug,
    eventSlug: event.slug
  }, { protocol: 'https://' } );

  w( utils.extend( {
    agenda: agenda,
    event: event,
    decorated: toDecorate,
    lang: false,                // given by options
    includePrivateData: false   // given by options
  }, options ) )

  .then( _addState ) // only if private data

  .then( _addFeatured )


  .then( _addCustomFields )

  .then( _addReferences )

  .then( _addContributorInfo )

  .then( _addCategory )

  .then( _addTags )

  .then( _addTagGroups )

  .then( _addFreeTextSuffixes )

  .done( v => {

    cb( null, v.decorated );

  }, cb );

}


function _addFreeTextSuffixes( v ) {

  let suffixes = v.agenda.getEventFreeTextSuffixes( false ),

  markedSuffixes = v.agenda.getEventFreeTextSuffixes( true );

  for ( let l in v.decorated.longDescription ) {

    if ( suffixes[ l ] ) {

      v.decorated.longDescription[ l ] += '\n\n' + suffixes[ l ];
      v.decorated.html[ l ] += '\n\n' + markedSuffixes[ l ];

    }

  }

  return v;

}


function _addTagGroups( v ) {

  let d = w.defer(),
  
  tagSlugs = [];

  v.decorated.tagGroups = [];

  if ( typeof v.decorated.tags == 'string' ) {

    tagSlugs = [ v.decorated.tags ];

  } else if ( v.decorated.tags ) {

    tagSlugs = v.decorated.tags.map( t => t.slug );

  }

  if ( !tagSlugs || !tagSlugs.length ) return v;

  agendaTags.get( v.agenda.id, ( err, tagSet ) => {

    if ( err ) return d.reject( err );

    v.decorated.tagGroups = ( tagSet ? tagSet.groups : [] )

    // keep groups containing tags used by event
    .filter( g => g.tags.filter( t => tagSlugs.indexOf( t.slug ) !== -1 ).length )

    // keep group tags used by event
    .map( g => ( {
      name: g.name,
      tags: g.tags.filter( t => tagSlugs.indexOf( t.slug ) !== -1 ).map( t => { return { label: t.label, slug: t.slug, id: t.id } } )
    } ) )

    // remove empty groups
    .filter( g => g.tags.length );


    // reuse tag group order with tags
    v.decorated.tags = v.decorated.tagGroups.reduce( ( carry, group ) => carry.concat( group.tags ), [] );

    d.resolve( v );

  } );

  return d.promise;

}


function _addTags( v ) {

  // if tags are already loaded no need to fetch again
  if ( v.decorated.tags ) return v;

  let d = w.defer();

  v.event.getAgendaTags( v.agenda.id, ( err, tags ) => {

    if ( err ) return d.reject( err );

    v.decorated.tags = tags;

    d.resolve( v );

  } );

  return d.promise;

}


function _addCategory( v ) {

  // if category is already present, no need to fetch again
  if ( v.decorated.category ) return v;

  let d = w.defer();

  v.event.getAgendaCategory( v.agenda.id, ( err, category ) => {

    if ( err ) return d.reject( err );

    v.decorated.category = category || null;

    d.resolve( v );

  } );

  return d.promise;

}


function _addReferences( v ) {

  v.decorated.references = [];

  let referenceSet = v.event.articles

  .filter( a => a.review.id===v.agenda.id )

  .map( a => a.references );

  if ( referenceSet.length ) {

    v.decorated.references = referenceSet[ 0 ];

  }

  return v;

}


function _addContributorInfo( v ) {

  let d = w.defer();

  v.event.getContributorInfo( v.agenda.id, ( err, contributorInfo ) => {

    v.decorated.contributor = null;

    if ( err ) return d.reject( err );

    if ( !contributorInfo ) return d.resolve( v );

    if ( !v.includePrivateData ) {

      v.decorated.contributor = {
        organization: contributorInfo.organization
      }

    } else {

      v.decorated.contributor = contributorInfo || null;

    }

    d.resolve( v );

  } );

  return d.promise;

}


function _addCustomFields( v ) {

  let d = w.defer(),

  customFieldsGetter = v.includePrivateData ? v.agenda.getEventCustom : v.agenda.getEventPublicCustomData;

  customFieldsGetter( v.event, v.lang, ( err, custom ) => {

    if ( err ) return d.reject( err );

    v.decorated.customValues = {};

    custom.forEach( c => {

      if ( c.fieldType === 'checkbox' ) {

        v.decorated.customValues[ c.name ] = !!c.value;

      } else if ( c.fieldType == 'image' && c.value ) {

        v.decorated.customValues[ c.name ] = config.aws.imageBucketPath + c.value;

      } else if ( c.fieldType !== 'image' ) {

        v.decorated.customValues[ c.name ] = c.value;

      }

    } );

    v.decorated.custom = custom;

    v.decorated.customLabels = v.agenda.getCustomFieldsLabels( v.event.getCurrentLanguage() );

    return d.resolve( v );

  } );

  return d.promise;

}


function _addFeatured( v ) {

  let d = w.defer();

  v.event.getFeatured( ( err, isFeatured ) => {

    if ( err ) return d.reject( err );

    v.decorated.featured = isFeatured;

    d.resolve( v );

  } );

  return d.promise;

}


function _addState( v ) {

  if ( !v.includePrivateData ) return v;

  let d = w.defer();

  v.event.getState( ( err, state ) => {

    if ( err ) return d.reject( err );

    v.decorated.state = state;

    d.resolve( v );

  } );

  return d.promise;

}