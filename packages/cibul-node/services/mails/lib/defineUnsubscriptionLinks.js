import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/mails/beforeSend');

function getTarget({ user, memberId, email }) {
  if (memberId) {
    return `member:${memberId}`;
  }
  return user ? `user:${user.uid}` : `email:${email}`;
}

export default async function defineUnsubscriptionLinks(
  services,
  config,
  params,
) {
  const { users: usersSvc, unsubscriptions: unsubscriptionsSvc } = services;

  log('processing', _.get(params, 'to.address'));

  const { unsubscriptions, address: email } = params.to;

  // user or email
  const user = await usersSvc.findOne({ query: { email, isActivated: true } });

  params.data.isRegisteredUser = !!user;

  if (!unsubscriptions || !unsubscriptions.length) {
    log('found no unsubscriptions');
    return;
  }

  log('found %s unsubscriptions', unsubscriptions.length);

  for (const unsubscription of unsubscriptions) {
    log('unsubscription', unsubscription);
    const { memberId, rule, dataPath } = unsubscription;

    const token = unsubscriptionsSvc.tokens.create({
      target: getTarget({ user, memberId, email }),
      rule,
    });

    const unsubscribeLink = `https://${config.domain}/unsubscribe/${token}`;

    _.set(params.data, dataPath, unsubscribeLink);

    if (!params.list || !params.list.unsubscribe) {
      params.list = {
        ...params.list,
        unsubscribe: [unsubscribeLink, 'support@openagenda.com'],
      };
    }
  }

  log('done', params.list);
}
