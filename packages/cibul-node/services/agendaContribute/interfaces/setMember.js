"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const { promisify } = require( 'util' );
const VError = require( '@openagenda/verror' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/interfaces/setMember' );

module.exports = async (services, agenda, user, current, posted) => {
  const {
    members
  } = services;

  try {

    const member = await members.get( {
      agendaUid: agenda.uid,
      userUid: user.uid
    } );

    const custom = JSON.parse( posted.data );

    log( member ? 'User is already member' : 'User is not member yet' );

    if ( !member ) {

      const { success } = await members.create( {
        agendaUid: agenda.uid,
        userUid: user.uid,
        role: 1,
        custom
      } );

      return success;

    }

    const { success } = await members.patch( {
      agendaUid: agenda.uid,
      userUid: user.uid
    }, { custom } );

    return success;

  } catch ( e ) {

    log( 'error', e );

    throw new VError( e, 'contribute: failed to set member' );

  }

}
