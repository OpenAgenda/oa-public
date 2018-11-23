"use strict";

const path = require( 'path' );
const _ = require( 'lodash' );
const axios = require( 'axios' );
const mails = require( '@openagenda/mails' );
const usersSvc = require( '@openagenda/users' );
const log = require( '@openagenda/logs' )( 'services/mails' );
const makeLabelGetter = require( '@openagenda/labels/makeLabelGetter' );
const labels = require( '@openagenda/labels/all' ).mails;
const { isUnsubscribed, createToken } = require( './unsubscription' );


const templateAbilities = {
  event: [ 'receive', 'event' ],
  notificationsSummary: [ 'receive', 'notificationsSummary' ],
  eventAggregation: [ 'receive', 'eventAggregation' ], // member too
  stakeholderMessage: [ 'receive', 'memberMessage' ], // member too
  stakeholderInvitation: [ 'receive', 'invitation' ],
  eventPublishContributor: [ 'receive', 'myEventChangeState' ], // member too
  inboxMessage: [ 'receive', 'inboxMessage' ] // member too
};
const unsubscribeLinkPaths = {
  event: 'unsubscribeLink',
  notificationsSummary: 'unsubscribeLink',
  eventAggregation: 'unsubscribeLink',
  stakeholderMessage: 'unsubscribeLink',
  stakeholderInvitation: 'unsubscribeLink',
  eventPublishContributor: 'unsubscribeLink',
  inboxMessage: 'unsubscribeLink'
};
const memberUnsubscribeLinkPaths = {
  eventAggregation: 'memberUnsubscribeLink',
  stakeholderMessage: 'memberUnsubscribeLink',
  eventPublishContributor: 'memberUnsubscribeLink',
  inboxMessage: 'memberUnsubscribeLink'
};

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
        emailSettingsLink: `https://${config.domain}/settings/unsubscribed`
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

    // Logging
    logger: config.getLogConfig( 'svc', 'mails', false ),

    disableVerify: config.mails.disableVerify,

    // Unsubscription
    sendFilter: async params => {
      const abilityArgs = templateAbilities[ params.template ];
      const email = params.to.address;
      const memberId = params.to.memberId;

      if ( !abilityArgs ) {
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

      // member
      if ( memberId ) {
        return !( await isUnsubscribed( { entityName: 'member', identifier: memberId }, ...abilityArgs ) );
      }

      return !( await isUnsubscribed( email, ...abilityArgs ) );
    },
    beforeSend: async params => {
      const abilityArgs = templateAbilities[ params.template ];
      const unsubscribeLinkPath = unsubscribeLinkPaths[ params.template ];
      const memberUnsubscribeLinkPath = memberUnsubscribeLinkPaths[ params.template ];
      const {
        address: email,
        memberId
      } = params.to;

      if ( !abilityArgs || !unsubscribeLinkPath ) {
        return;
      }

      // user or email
      const user = await usersSvc.findOne( { query: { email } } );
      const firstEntity = user ? { entityName: 'user', identifier: user.uid } : { email };

      const unsubscribeToken = await createToken( firstEntity, ...abilityArgs );
      const unsubscribeLink = `https://${config.domain}/unsubscribe/${unsubscribeToken}`;
      _.set( params.data, unsubscribeLinkPath, unsubscribeLink );

      // member
      if ( memberId ) {
        const memberUnsubscribeToken = await createToken(
          { entityName: 'member', identifier: memberId },
          ...abilityArgs
        );
        const memberUnsubscribeLink = `https://${config.domain}/unsubscribe/${memberUnsubscribeToken}`;
        _.set( params.data, memberUnsubscribeLinkPath, memberUnsubscribeLink );
      }

      params.data.isRegisteredUser = [ 'user', 'member' ].includes( firstEntity.entityName );

      params.list = Object.assign( {}, params.list, {
        unsubscribe: [
          unsubscribeLink,
          'support@openagenda.com'
        ]
      } );
    }
  } );

};
