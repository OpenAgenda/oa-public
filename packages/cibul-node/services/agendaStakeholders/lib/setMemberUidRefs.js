"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'services/agendaStakeholders/setMemberUidRefs' );

const config = require( '../../../config' );

module.exports = async stakeholder => {

  const { knex } = config;

  try {

    const update = _.omitBy( {
      agenda_uid: _.get( await knex( 'review' ).first( 'uid' ).where( 'id', _.get( stakeholder, 'agendaId' ) ), 'uid' ),
      user_uid: _.get( await knex( 'user' ).first( 'uid' ).where( 'id', _.get( stakeholder, 'userId' ) ), 'uid' )
    }, _.isUndefined );

    if ( !_.keys( update ).length ) return;

    await knex( 'reviewer' ).update( update ).where( 'id', stakeholder.id );

  } catch ( e ) {

    log( 'error', 'could not set uid refs for member', _.get( stakeholder, 'id' ), e )

  }


}
