"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'services/mails/beforeSend' );
const createUnsubscriptionToken = require( './createUnsubscriptionToken' );
const app = require( '../../../app' );


module.exports = async ( config, params ) => {
  await defineUnsubscriptionLinks( config, params );

  await defineReplyToHeaders( config, params );
};


async function defineUnsubscriptionLinks( config, params ) {
  log( 'processing', _.get( params, 'to.address' ) );

  const {
    unsubscriptions,
    address: email
  } = params.to;

  // user or email
  const user = await app.service( '/users' ).findOne( { query: { email } } );

  params.data.isRegisteredUser = !!user;

  if ( !unsubscriptions || !unsubscriptions.length ) {
    log( 'found no unsubscriptions' );
    return;
  }

  log( 'found %s unsubscriptions', unsubscriptions.length );

  const firstEntity = user ? { entityName: 'user', identifier: user.uid } : { email };

  for ( const unsubscription of unsubscriptions ) {
    log( 'unsubscription', unsubscription );
    const { memberId, rule, dataPath } = unsubscription;
    const entity = memberId ? { entityName: 'member', identifier: memberId } : firstEntity;

    const unsubscribeToken = await createUnsubscriptionToken( config, entity, ...rule );
    const unsubscribeLink = `https://${config.domain}/unsubscribe/${unsubscribeToken}`;

    _.set( params.data, dataPath, unsubscribeLink );

    if ( !params.list || !params.list.unsubscribe ) {
      params.list = Object.assign( {}, params.list, {
        unsubscribe: [
          unsubscribeLink,
          'support@openagenda.com'
        ]
      } );
    }
  }

  log( 'done', params.list );
}

async function defineReplyToHeaders( config, params ) {
  // Only for inboxMessage for now


}

