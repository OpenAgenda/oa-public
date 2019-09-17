"use strict";

const _ = require( 'lodash' );
const config = require( '../config' );

module.exports = objectId => ( {

  aggregators: {
    list: aggregatorList.bind( null, objectId )
  }

} );

async function aggregatorList( objectId ) {

  const { knex, interfaces } = config;

  const object = await interfaces.getObject( objectId );

  if ( object === null ) return [];

  const result = await knex('aggregator_source as ags')
    .select('ag.review_id as aggregatorObjectId')
    .leftJoin('aggregator as ag', 'ags.aggregator_id', 'ag.id')
    .where('ags.review_id', object.id)
    .whereNull('version');

  const objectIds = result.map( row => row.aggregatorObjectId );

  const activeObjects = await interfaces.keepActiveAggregators( objectIds );

  return activeObjects;

}
