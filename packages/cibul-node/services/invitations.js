"use strict";

const _ = require( 'lodash' );

const invitations = require( '@openagenda/invitations' );
const log = require( '@openagenda/logs' )( 'services/invitations' );

const members = require( './members' );

module.exports.init = config => {

  invitations.init( {
    mysql: config.db,
    schemas: config.schemas,
    interfaces: {
      onAssign: ( action, invitation, cb ) => cb( null )
    },
    actions: {
      linkMember: ( executeData, actionParams, cb ) => {
        _linkMember( executeData, actionParams ).then( () => cb(), cb );
      }
    }
  } );

}

async function _linkMember( { user }, [ member, context ] ) {

  log( 'linking', user, member, context );

  const currentMember = await members.get( member.id );

  if ( !currentMember ) throw new Error( 'Member not found' );

  const customData = _.set(
    currentMember.custom,
    'contactName',
    _.get( currentMember, 'custom.contactName', user.fullName )
  );

  return members.patch( member.id, {
    userUid: user.uid,
    custom: customData
  }, {
    context,
    requireCustom: false
  } );
}
