"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const w = require( 'when' );

const agendaCategories = require( '@openagenda/agenda-categories' );
const agendaTags = require( '@openagenda/agenda-tags' );
const countryLabels = require( '@openagenda/labels/agenda-locations/countries' );
const slugs = require( '@openagenda/slugs' );
const utils = require( '@openagenda/utils' );

const genUrl = require( '../genUrl' );
const config = require( '../../config' );

let svc;

module.exports = function( service ) {

  svc = service;

  return {
    decorateEvents,
    decorateEvent
  }

}


function decorateEvents( agenda, events, toDecorate, options, cb ) {

  let i = 0;

  agendaTags.get( agenda.id, ( err, tagSet ) => {

    if ( err ) return cb( err );

    agenda.tagSet = tagSet;

    async.eachSeries( events, ( event, ecb ) => {

      decorateEvent( agenda, event, toDecorate[ i++ ], options, ecb );

    }, cb );

  } );

}


function _loadTagSet( v ) {

  if ( !v.loadTagSet || v.agenda.tagSet ) return v;

  const d = w.defer();

  agendaTags.get( v.agenda.id, ( err, tagSet ) => {

    if ( err ) return d.reject( err );

    v.agenda.tagSet = tagSet;

    d.resolve( v );

  } );

  return d.promise;

}


function decorateEvent( agenda, event, toDecorate, options, cb ) {

  toDecorate.canonicalUrl = genUrl( 'agendaEventShow', {
    slug: agenda.slug,
    eventSlug: event.slug
  }, { protocol: 'https://' } );

  w( utils.extend( {
    multiLang: true,
    longDescriptionField: toDecorate.freeText && !toDecorate.longDescription ? 'freeText' : 'longDescription',
    agenda,
    event,
    loadTagSet: false,
    decorated: toDecorate,
    lang: false,                // given by options
    includePrivateData: false   // given by options
  }, options ) )

  .then( _addState ) // only if private data

  .then( _addFeatured )

  .then( _loadTagSet )

  .then( _addCustomFields )

  .then( _addReferences )

  .then( _addContributorInfo )

  .then( _addCountry )

  .then( _addCategory )

  .then( _addTags )

  .then( _addTagGroups )

  .then( _addFreeTextSuffixes )

  .done( v => {

    cb( null, v.decorated );

  }, cb );

}


function _addFreeTextSuffixes( v ) {

  const suffixes = v.agenda.getEventFreeTextSuffixes( false );

  const markedSuffixes = v.agenda.getEventFreeTextSuffixes( true );

  if ( !v.multiLang ) {

    let separator = '\n\n';

    if ( v.decorated[ v.longDescriptionField ] === null ) {

      v.decorated[ v.longDescriptionField ] = '';
      v.decorated.html = '';

      separator = '';

    }

    if ( suffixes[ v.lang ] ) {

      v.decorated[ v.longDescriptionField ] += '\n\n' + ( v.longDescriptionField === 'freeText' ? markedSuffixes : suffixes )[ v.lang ];

      if ( v.decorated.html ) v.decorated[ v.longDescriptionField ] += '\n\n' + markedSuffixes[ v.lang ];

    }

  } else {

    Object.keys( suffixes ).forEach( l => {

      let separator = '\n\n';

      if ( !v.decorated[ v.longDescriptionField ] ) {

        v.decorated[ v.longDescriptionField ] = {};

      }

      if ( !v.decorated[ v.longDescriptionField ][ l ] ) {

        separator = '';

        v.decorated[ v.longDescriptionField ][ l ] = '';

        v.decorated.html[ l ] = '';

      }


      v.decorated[ v.longDescriptionField ][ l ] += separator + ( v.longDescriptionField === 'freeText' ? markedSuffixes : suffixes )[ l ];

      v.decorated.html[ l ] += separator + markedSuffixes[ l ];

    } );


  }

  return v;

}



function _addTagGroups( v ) {

  let tagSlugs = [];

  v.decorated.tagGroups = [];

  if ( typeof v.decorated.tags == 'string' ) {

    tagSlugs = [ v.decorated.tags ];

  } else if ( v.decorated.tags ) {

    tagSlugs = v.decorated.tags.map( t => t.slug );

  }

  if ( !tagSlugs || !tagSlugs.length ) return v;

  const tagSet = v.agenda.tagSet;

  v.decorated.tagGroups = ( tagSet ? tagSet.groups : [] )

  // includePrivateData

  // keep groups containing tags used by event
  .filter( g => g.tags.filter( t => tagSlugs.indexOf( t.slug ) !== -1 ).length )

  // keep group tags used by event
  .map( g => ( {
    name: g.name,
    access: g.access || 'public',
    slug: g.name ? slugs.generate( g.name ) : null,
    tags: g.tags.filter( t => tagSlugs.indexOf( t.slug ) !== -1 ).map( t => ( _.assign( {
      label: t.label,
      slug: t.slug,
      id: t.id
    }, t.schemaOptionId ? { schemaOptionId: t.schemaOptionId } : {} ) ) )
  } ) )

  .filter( g => {

    if ( v.includePrivateData ) return true;

    return _.get( g, 'access', 'public' ) === 'public'

  } )

  // remove empty groups
  .filter( g => g.tags.length );


  // reuse tag group order with tags
  v.decorated.tags = v.decorated.tagGroups.reduce( ( carry, group ) => carry.concat( group.tags ), [] );

  return v;

}


function _addTags( v ) {

  // if tags are already loaded no need to fetch again
  if ( v.decorated.tags ) return v;

  let d = w.defer();

  // includePrivateData

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

      v.decorated.contributor = contributorInfo || null;

    }

    d.resolve( v );

  } );

  return d.promise;

}


function _addCustomFields( v ) {

  const d = w.defer();

  const customFieldsGetter = v.includePrivateData ? v.agenda.getEventCustom : v.agenda.getEventPublicCustomData;

  customFieldsGetter( v.event, v.lang, ( err, custom, privateExists ) => {

    if ( err ) return d.reject( err );

    v.decorated.hasPrivateCustomFields = privateExists;

    v.decorated.customValues = {};

    custom.forEach( c => {

      if ( c.fieldType === 'checkbox' ) {

        v.decorated.customValues[ c.name ] = !!c.value;

      } else if ( c.fieldType == 'image' && c.value ) {

        v.decorated.customValues[ c.name ] = config.aws.imageBucketPath + c.value;

      } else if ( c.fieldType == 'file' && c.value ) {

        const uploaded = config.aws.imageBucketPath + c.value.uploaded;

        c.value.embed = '<iframe height="500" width="100%" src="' + uploaded + '" frameborder="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>';

        c.value.link = `${config.root}/${v.agenda.slug}/events/${v.event.slug}/files/${c.name}`;

        v.decorated.customValues[ c.name ] = {
          name: c.value.name,
          uploaded,
          embed: c.value.embed,
          link: c.value.link
        }

      } else if ( ![ 'image', 'file' ].includes( c.fieldType ) ) {

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

function _addCountry( v ) {

  if ( !_.get( v, 'decorated.location.countryCode', null ) ) return v;

  v.decorated.location.country = countryLabels[ v.decorated.location.countryCode.toUpperCase() ] || null;

  return v;

}


function _addState( v ) {

  if ( !v.includePrivateData ) return v;

  const d = w.defer();

  v.event.getState( ( err, state ) => {

    if ( err ) return d.reject( err );

    v.decorated.state = state;

    d.resolve( v );

  } );

  return d.promise;

}
