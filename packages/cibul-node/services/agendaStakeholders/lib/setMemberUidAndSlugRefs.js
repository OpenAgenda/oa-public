"use strict";

const _ = require( 'lodash' );
const slug = require( 'slug' );
const log = require( '@openagenda/logs' )( 'services/agendaStakeholders/setMemberUidAndSlugRefs' );

const config = require( '../../../config' );

module.exports = async stakeholder => {

  const { knex } = config;

  try {

    const current = await knex( 'reviewer' ).first( [ 'agenda_uid', 'user_uid', 'slug' ] ).where( 'id', stakeholder.id );

    const update = {};

    if ( !current.agenda_uid && _.get( stakeholder, 'agendaId' ) ) {
      const agendaUid = _.get( await knex( 'review' ).first( 'uid' ).where( 'id', _.get( stakeholder, 'agendaId' ) ), 'uid' );
      if ( agendaUid ) update.agenda_uid = agendaUid;
    }

    if ( !current.user_uid && _.get( stakeholder, 'userId' ) ) {
      const userUid = _.get( await knex( 'user' ).first( 'uid' ).where( 'id', _.get( stakeholder, 'userId' ) ), 'uid' );
      if ( userUid ) update.user_uid = userUid;
    }

    if ( _.get( stakeholder, 'custom.contactName', '' ).length ) {
      update.slug = slug( _.get( stakeholder, 'custom.contactName' ), { lower: true } );
    } else if ( !current.slug && _.get( stakeholder, 'userId' ) ) {
      const fullName = _.get( await knex( 'user' ).first( 'full_name' ).where( 'id', _.get( stakeholder, 'userId' ) ), 'full_name' );
      update.slug = slug( fullName, { lower: true } );
    }

    if ( !_.keys( update ).length ) return;

    await knex( 'reviewer' ).update( update ).where( 'id', stakeholder.id );

  } catch ( e ) {

    log( 'error', 'could not set uid refs for member', _.get( stakeholder, 'id' ), e )

  }


}
