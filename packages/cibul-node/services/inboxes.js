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
      avatar: user.image ? config.aws.imageBucketPath + user.image : config.aws.defaultImagePath
    }) );
}

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
  ))[ 0 ].map( v => ({
    uid: v.uid,
    name: v.title,
    avatar: v.image || config.aws.defaultImagePath
  }) );

  return [ ...users, ...agendas ];
}

async function onAction( conversation, action ) {
  switch ( conversation.type ) {
    case 'event': {
      //
    }
  }
}

const interfaces = {
  getUsersDetails,
  getInboxesDetails,
  onAction
};

module.exports.init = async config => {
  await inboxes.init(
    _.merge( config, {
      migrations: {
        tableName: 'inboxes_migrations'
      },
      interfaces,
      types: {
        event: {
          actions: {
            from: null,
            to: [ {
              code: 'resolve',
              label: {
                fr: 'Terminer',
                en: 'Terminate'
              },
              kind: 'success'
            } ]
          }
        }
      }
    } )
  );
  await inboxMw.init( _.merge( config, { interfaces, mw: { limit: 20 } } ) );
};
