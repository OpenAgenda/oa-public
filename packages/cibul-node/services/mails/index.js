"use strict";

const path = require( 'path' );
const _ = require( 'lodash' );
const axios = require( 'axios' );
const redis = require( 'redis' );
const mails = require( '@openagenda/mails' );
const queuesLib = require( '@openagenda/queues' );
const usersSvc = require( '@openagenda/users' );
const log = require( '@openagenda/logs' )( 'services/mails' );
const makeLabelGetter = require( '@openagenda/labels/makeLabelGetter' );
const labels = require( '@openagenda/labels/all' ).mails;
const { isUnsubscribed, createToken } = require( './unsubscription' );


module.exports.init = async config => {

  await mails.init( {
    // Templating
    templatesDir: path.join( __dirname, 'templates' ),

    // Mailing
    transport: config.mails.transport,
    defaults: {
      ...config.mails.defaults,
      data: {
        _,
        root: config.root,
        emailSettingsLink: `https://${config.domain}/settings/emails`
      }
    },

    // Localization
    translations: {
      labels,
      makeLabelGetter
    },

    // Queuing
    redis: config.redis,
    queueName: 'mails',
    queue: queuesLib.v2( {
      redis: redis.createClient( config.redis ),
      prefix: 'mails:'
    } ),

    // Logging
    logger: config.getLogConfig( 'svc', 'mails', false ),

    disableVerify: config.mails.disableVerify,

    // Unsubscription
    sendFilter: async params => {
      const unsubscriptions = params.to.unsubscriptions;
      const abilityArgs = unsubscriptions && unsubscriptions.length
        ? _.find( unsubscriptions, 'memberId' ) || unsubscriptions[ unsubscriptions.length - 1 ]
        : null;
      const email = params.to.address;

      if ( !abilityArgs || !abilityArgs.rule ) {
        return true;
      }

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

      const { memberId, rule } = abilityArgs;

      // member
      if ( memberId ) {
        return !( await isUnsubscribed( { entityName: 'member', identifier: memberId }, ...rule ) );
      }

      return !( await isUnsubscribed( email, ...rule ) );
    },
    beforeSend: async params => {
      const {
        unsubscriptions,
        address: email
      } = params.to;

      // user or email
      const user = await usersSvc.findOne( { query: { email } } );

      params.data.isRegisteredUser = !!user;

      if ( !unsubscriptions || !unsubscriptions.length ) {
        return;
      }

      const firstEntity = user ? { entityName: 'user', identifier: user.uid } : { email };

      for ( const unsubscription of unsubscriptions ) {
        const { memberId, rule, dataPath } = unsubscription;
        const entity = memberId ? { entityName: 'member', identifier: memberId } : firstEntity;

        const unsubscribeToken = await createToken( entity, ...rule );
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
    }
  } );

};
