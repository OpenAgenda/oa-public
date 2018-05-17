"use strict";

const _ = require( 'lodash' );
const config = require( '../config' );

module.exports = agendaUid => ( {

  aggregators: {
    list: aggregatorList.bind( null, agendaUid )
  }

} )

async function aggregatorList( agendaUid ) {

  const { knex, interfaces } = config;

  const agendaId = await interfaces.getAgendaId( agendaUid );

  if ( agendaId === null ) return [];

  const result = await knex( 'aggregator_source as ags' )
    .select( 'ag.review_id as aggregatorAgendaId' )
    .leftJoin( 'aggregator as ag', 'ags.aggregator_id', 'ag.id' )
    .where( 'ags.review_id', agendaId );

  const agendaIds = result.map( row => row.aggregatorAgendaId );

  const activeAgendas = await interfaces.keepActiveAggregators( agendaIds );

  return activeAgendas;

}