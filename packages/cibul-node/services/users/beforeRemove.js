const { promisify } = require( 'util' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const activities = require( '@openagenda/activities' );

/**
 * this interface will prevent user removal if not correctly executed
 */
module.exports = async function beforeRemove( user ) {

  // remove 100 stakeholders

  await promisify( activities.feed( { entityType: 'user', entityUid: user.uid } ).remove )();

  const stakeholders = await promisify( agendaStakeholders.user( user.id ).list )( 0, 100 );

  for ( const sh of stakeholders ) {

    try {

      await promisify( agendaStakeholders.agenda( sh.agendaId ).update )(
        { id: sh.id },
        {},
        {
          allowPartial: true,
          deletedUser: true
        }
      );

    } catch ( err ) {

      log( 'error', 'could not remove stakeholder ', err );

    }

  }

};
