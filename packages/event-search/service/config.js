"use strict";

const config = {};
const extend = require( 'lodash/extend' );
const elasticsearch = require( 'elasticsearch' );
const logger = require( '@openagenda/logs' );

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
      'agenda.uid',
      'agenda.title',
      'agenda.image',
      'timings',
      'location.name',
      'location.address',
      'location.latitude',
      'location.longitude',
      'contributor.organization',
      'timezone'
    ],
    detailedSearchIncludes: [
      'title', 'description', 'keywords', 'dateRange', 'longDescription', 'html',
      'image', 'uid', 'slug', 'agenda', 'creatorUid', 'locationUid',
      'location', 'country', 'timezone', 'registration',
      'timings', 'createdAt', 'updatedAt',
      'accessibility', 'private', 'draft', 'age',
      'contributor'
    ],
    logger: null
  } );

  if ( c.logger ) {

    logger.setModuleConfig( c.logger );

  }

};

function _createClient( esConfig ) {

  if ( client ) return client;

  client = new elasticsearch.Client( esConfig );

  return client;

}