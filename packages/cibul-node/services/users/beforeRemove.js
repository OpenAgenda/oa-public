const { promisify } = require( 'util' );

/**
 * this interface will prevent user removal if not correctly executed
 */
module.exports = function beforeRemove( { services } ) {

  const {
    activities: activitiesSvc,
    members: membersSvc
  } = services;

  return async ctx => {

    const user = ctx.params.before;

    if ( !user ) {
      return ctx;
    }

    await promisify( activitiesSvc.feed( { entityType: 'user', entityUid: user.uid } ).remove )();

    const members = await membersSvc.list( { userUid: user.uid }, { limit: 1000 } );

    for ( const member of members ) {

      try {

        await membersSvc.patch(
          member.id,
          { deletedUser: true }
        );

      } catch ( err ) {

        log( 'error', 'could not remove member ', err );

      }

    }

  };

};
