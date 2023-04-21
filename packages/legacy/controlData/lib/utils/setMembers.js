"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'controlData/utils/setTags' );

const roles = require( './roles' );

module.exports = async ( ctl, knex, agendaId ) => {

  const members = await knex.select( 'uid', 'credential' )
    .from( 'reviewer as rr' )
    .leftJoin( 'user as u', 'rr.user_id', 'u.id' )
    .where( 'rr.review_id', agendaId )
    .whereNotNull( 'uid' )

  members.forEach( m => {

    ctl[ roles[ m.credential ] ].push( m.uid );

  } );

};
