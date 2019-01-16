"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'controlData/utils/setTags' );

const credKeys = {
  1: 'e',
  2: 'adm',
  3: 'mod'
}

module.exports = async ( ctl, knex, agendaId ) => {

  const members = await knex.select( 'uid', 'credential' )
    .from( 'reviewer as rr' )
    .leftJoin( 'user as u', 'rr.user_id', 'u.id' )
    .where( 'rr.review_id', agendaId )
    .whereNotNull( 'uid' )

  members.forEach( m => {

    ctl[ credKeys[ m.credential ] ].push( m.uid );

  } );

};
