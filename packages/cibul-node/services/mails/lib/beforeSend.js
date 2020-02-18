"use strict";

const _ = require('lodash');
const log = require('@openagenda/logs')('services/mails/beforeSend');
const createUnsubscriptionToken = require('./createUnsubscriptionToken');


module.exports = async (services, config, params) => {
  const usersSvc = services.users;
  const { address: email } = params.to;

  const recipientUser = await usersSvc.findOne({ query: { email } });

  await defineUnsubscriptionLinks(services, config, recipientUser, params);
};


async function defineUnsubscriptionLinks(services, config, recipientUser, params) {
  log('processing', _.get(params, 'to.address'));

  const usersSvc = services.users;

  const {
    unsubscriptions,
    address: email
  } = params.to;

  params.data.isRegisteredUser = !!recipientUser;

  // user or email
  const user = await usersSvc.findOne( { query: { email } } );

  params.data.isRegisteredUser = !!user;

  if (!unsubscriptions || !unsubscriptions.length) {
    log('found no unsubscriptions');
    return;
  }

  log('found %s unsubscriptions', unsubscriptions.length);

  // user or email
  const firstEntity = recipientUser ? { entityName: 'user', identifier: recipientUser.uid } : { email };

  for (const unsubscription of unsubscriptions) {
    log('unsubscription', unsubscription);
    const { memberId, rule, dataPath } = unsubscription;
    const entity = memberId ? { entityName: 'member', identifier: memberId } : firstEntity;

    const unsubscribeToken = await createUnsubscriptionToken(config, entity, ...rule);
    const unsubscribeLink = `https://${config.domain}/unsubscribe/${unsubscribeToken}`;

    _.set(params.data, dataPath, unsubscribeLink);

    if (!params.list || !params.list.unsubscribe) {
      params.list = Object.assign({}, params.list, {
        unsubscribe: [
          unsubscribeLink,
          'support@openagenda.com'
        ]
      });
    }
  }

  log('done', params.list);
}

