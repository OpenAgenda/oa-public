import _ from 'lodash';
import logs from '@openagenda/logs';

import {
  convertRuleArrayToObject,
  isMailgunBounced,
  ccIsDestinary,
} from './utils.js';

const log = logs('services/mails/filterBouncingAndUnsubscribed');

export default async function filterBouncingAndUnsubscribed(
  services,
  config,
  params,
) {
  const { unsubscriptions: unsubscriptionsSvc, users, abilities } = services;

  const {
    mails: { domain: mailsDomain },
  } = config;

  const { unsubscriptions, address: email } = params[ccIsDestinary({ mailsDomain }, params) ? 'cc' : 'to'];

  log('evaluating', {
    template: params.template,
    email,
  });

  const abilityArgs = unsubscriptions?.length
    ? _.find(unsubscriptions, 'memberId')
      || unsubscriptions[unsubscriptions.length - 1]
    : null;

  if (!abilityArgs || !abilityArgs.rule) {
    log(
      '  no ability has been found for unsubscriptions instructions %j',
      unsubscriptions,
    );
    return true;
  }

  const { memberId, rule } = abilityArgs;

  const memberAbility = memberId && await abilities.get('member', memberId);

  const ruleObj = convertRuleArrayToObject(rule);

  if (memberAbility) {
    const sendEmail = memberAbility.can(
      ruleObj.action,
      ruleObj.subject,
      ruleObj.conditions,
      ruleObj.fields,
    );
    log(
      '  user is a member (%s) and %s to receive email',
      memberId,
      sendEmail ? 'wants' : 'does not want',
    );
    return sendEmail;
  }

  const user = await users.findOne({
    query: { email },
  });

  if (user) {
    const sendEmail = await abilities
      .get('user', user.uid)
      .then((ability) =>
        ability.can(
          ruleObj.action,
          ruleObj.subject,
          ruleObj.conditions,
          ruleObj.fields,
        ));

    log(
      '  an account exists for email, abilities svc is reference for filtering email',
      {
        email,
        userUid: user.uid,
        sendEmail,
      },
    );
    return sendEmail;
  }

  if (await unsubscriptionsSvc.registry.isRegistered(email)) {
    log.info(
      '  no account is associated with email but it is registered in the unsubscription registry. Filtering.',
      {
        email,
      },
    );
    return false;
  }

  if (config.mailgun && await isMailgunBounced(config.mailgun, email)) {
    log.info('  mailgun bounced email. Filtering.', { email });
    return false;
  }

  log(
    'not filtering, send can proceed',
    JSON.stringify(params.template, null, 2),
  );

  return true;
}
