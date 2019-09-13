"use strict";

const _ = require( 'lodash' );

const isUnsubscribed = require( './isUnsubscribed' );

const log = require( '@openagenda/logs' )( 'services/mails/filterBouncingAndUnsubscribed' );

module.exports = async ( config, params ) => {
  const unsubscriptions = params.to.unsubscriptions;
  const abilityArgs = unsubscriptions && unsubscriptions.length
    ? _.find( unsubscriptions, 'memberId' ) || unsubscriptions[ unsubscriptions.length - 1 ]
    : null;
  const email = params.to.address;

  try {
    const { data: bounce } = await axios( `https://api.mailgun.net/v3/${config.mailgun.domain}/bounces/${email}`, {
      auth: {
        username: 'api',
        password: config.mailgun.apiKey
      }
    } );

    if ( bounce && bounce.code ) {
      return false;
    }
  } catch ( error ) {
    if ( error.response && error.response.status !== 404 ) {
      log.error( 'Cannot check bounced address on Mailgun', error );
    }
  }

  if ( !abilityArgs || !abilityArgs.rule ) {
    return true;
  }

  const { memberId, rule } = abilityArgs;

  // member
  if ( memberId ) {
    return !( await isUnsubscribed( config, { entityName: 'member', identifier: memberId }, ...rule ) );
  }

  return !( await isUnsubscribed( config, email, ...rule ) );
}
