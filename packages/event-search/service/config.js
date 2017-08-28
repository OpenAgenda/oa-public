"use strict";

const config = {};

const extend = require( 'lodash/extend' );

const elasticsearch = require( 'elasticsearch' );

let client;

module.exports = config;

module.exports.init = c => { 

  extend( config, c, {
    client: _createClient( c.elasticsearch ),
    type: 'event',
    baseSearchIncludes: [
      'uid',
      'title',
      'dateRange',
      'image',
      'keywords',
      'slug',
      'agenda',
      'timings',
      'location.name',
      'location.address',
      'contributor.organization',
      'timezone'
    ],
    detailedSearchIncludes: [
      'title', 'description', 'keywords', 'dateRange', 'longDescription',
      'image', 'uid', 'slug', 'agenda', 'creatorUid', 'locationUid',
      'location', 'country', 'timezone', 'registration',
      'timings', 'createdAt', 'updatedAt',
      'accessibility', 'private', 'draft', 'age',
      'contributor'
    ]
  } );

};

function _createClient( esConfig ) {

  if ( client ) return client;

  client = new elasticsearch.Client( esConfig );

  return client;

}