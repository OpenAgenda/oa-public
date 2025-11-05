import ky from 'ky';
import logs from '@openagenda/logs';

const log = logs('services/mails/utils');

const isNumberLike = (value) =>
  !Number.isNaN(Number(value)) && Number.isFinite(parseInt(value, 10));

export function convertRuleArrayToObject(rule) {
  const [action, subject, conditions, fields] = rule;

  return {
    action,
    subject,
    conditions,
    fields,
  };
}

export function cleanTarget(dirty) {
  const [targetType, targetValue] = dirty.split(':');

  return {
    type: targetType,
    value: isNumberLike(targetValue) ? parseInt(targetValue, 10) : targetValue,
  };
}

export async function isMailgunBounced(mailgunConfig, email) {
  const {
    auth: { domain, apiKey },
  } = mailgunConfig;

  try {
    const bounce = await ky
      .get(`https://api.mailgun.net/v3/${domain}/bounces/${email}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        },
      })
      .json();

    if (bounce && bounce.code) {
      return true;
    }
    log('  %s did not bounce', email);
  } catch (error) {
    if (error.response && error.response.status !== 404) {
      log.error('  Cannot check bounced address on Mailgun', error);
    }
  }
  return false;
}

export function ccIsDestinary({ mailsDomain }, { to, cc }) {
  return to.address.split('@').pop() === mailsDomain && !!cc;
}
