"use strict";

const wn = require( 'when/node' );
const _ = require( 'lodash' );
const inboxes = require( '@openagenda/inboxes' );
const inboxMw = require( '@openagenda/inboxes/lib/middleware' );
const userSvc = require( '@openagenda/users' );
const agendasSvc = require( '@openagenda/agendas' );
const config = require( '../config' );

async function getUsersDetails( usersToBeDetailed ) {

  if ( usersToBeDetailed.length === 0 ) {
    return [];
  }

  return (await userSvc.list( { uid: usersToBeDetailed.map( v => v.userUid ) }, 0, 100, { removed: null } ))
    .users
    .map( user => ({
      uid: user.uid,
      name: user.fullName,
      avatar: config.aws.imageBucketPath + user.image
    }) );
};

async function getInboxesDetails( inboxesToBeDetailed ) {

  const usersToBeDetailed = inboxesToBeDetailed
    .filter( v => v.type === 'user' )
    .map( v => ({ userUid: v.identifier }) );
  const agendasToBeDetailed = inboxesToBeDetailed.filter( v => v.type === 'agenda' );

  const users = await getUsersDetails( usersToBeDetailed );
  const agendas = agendasToBeDetailed.length === 0 ? [] : (await wn.call( agendasSvc.list,
    { uid: agendasToBeDetailed.map( v => v.identifier ) },
    {
      private: null,
      includeImagePath: true,
      useDefaultImage: true
    }
  ))
    .map( v => ({
      uid: v.uid,
      name: v.title,
      avatar: v.image
    }) );

  return [ ...users, ...agendas ];

}

const interfaces = {
  getUsersDetails,
  getInboxesDetails,
  onAction: ( conversation, action ) => {
  }
};

module.exports.init = async config => {
  await inboxes.init(
    _.merge( config, {
      migrations: {
        tableName: 'inboxes_migrations'
      },
      interfaces,
      types: {
        event: {}
      }
    } )
  );
  await inboxMw.init( _.merge( config, { interfaces, mw: { limit: 20 } } ) );
};
