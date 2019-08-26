"use strict";

const _ = require('lodash');
const log = require('@openagenda/logs')('services/mails/beforeSend');
const createUnsubscriptionToken = require('./createUnsubscriptionToken');
const usersSvc = require('../../users');


module.exports = async (config, params) => {
  const { address: email } = params.to;

  const recipientUser = await usersSvc.findOne({ query: { email } });

  await defineUnsubscriptionLinks(config, recipientUser, params);

  await defineReplyToHeaders(config, recipientUser, params);
};


async function defineUnsubscriptionLinks(config, recipientUser, params) {
  log('processing', _.get(params, 'to.address'));

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

async function defineReplyToHeaders(config, recipientUser, params) {
  // Only for inboxMessage for now

  // if (params.template === 'inboxMessage') {
  //   const { data, conversation } = params;
  //   const { senderName } = data;
  //
  //   const reference = `inboxMessage/${conversation.id}@mail.openagenda.com`;
  //
  //   params.from = {
  //     name: senderName,
  //     address: 'notifications@mail.openagenda.com'
  //   };
  //
  //   params.headers = Object.assign(params.headers || {}, {
  //     References: reference,
  //     'In-Reply-To': reference
  //   });
  // }
}

