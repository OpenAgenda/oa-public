"use strict";

const { promisify } = require( 'util' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'services/agendaContribute/interfaces/setMember' );
const members = require( '@openagenda/agenda-stakeholders' );

const memberMap = require( '../lib/stakeholder.map' );

module.exports = async ( agenda, user, current, data ) => {

  /**
   * stakeholders service is aging. It does not support promises,
   * and verifies existence of member using the email.
   * So it is not possible to create a new stakeholder with a different
   * email than the one used for the account.
   *
   * This is why member is first created when needed with the email of the user account.
   */

   try {

    const agendaMembers = {
      get: promisify( members( agenda.id ).get ),
      create: promisify( members( agenda.id ).create ),
      update: promisify( members( agenda.id ).update )
    }

    const stakeholderData = memberMap.toStakeholder( data );

    const isMember = !!( await agendaMembers.get( { userId: user.id } ) );

    log( isMember ? 'User is already member' : 'User is not member yet' );

    if ( !isMember ) {

      await agendaMembers.create( _.set( stakeholderData, { email: { $set: req.user.email } } ) );

    }

    const { success } = await agendaMembers.update( { userId: user.id }, stakeholderData );

    return success;

  } catch ( e ) {

    log( 'error', e );

    throw new VError( 'contribute: failed to set member', e );

  }

}
