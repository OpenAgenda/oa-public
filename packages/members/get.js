import { NotFound } from '@openagenda/verror';
import { fromDB } from './lib/transformDBEntry.js';
import decorateWithDetailed from './lib/decorateWithDetailed.js';
import getQueryAndOptions from './lib/getQueryAndOptions.js';

const cleanEmail = (email) => email.replace(/‐/g, '-');

async function get(config, identifier, options = {}) {
  const { query, options: cleanOptions } = getQueryAndOptions(
    config,
    identifier,
    options,
  );

  const member = await fromDB(
    {
      customDataAtRoot: cleanOptions.customDataAtRoot,
      includeLegacyFields: cleanOptions.legacy,
    },
    await query,
  );

  if (!member && cleanOptions.throwOnNotFound) {
    throw new NotFound('member not found');
  }

  if (member && cleanOptions.detailed) {
    await decorateWithDetailed(config, member);
  }

  return member;
}

async function getByEmail(config, identifier, options = {}) {
  if (
    typeof identifier !== 'object'
    || identifier === null
    || Array.isArray(identifier)
  ) {
    throw new Error(
      'Bad request: identifier must be an object containing at least an email and another identifier',
    );
  } else if (!identifier.email) {
    throw new Error('Bad request: email is missing in identifier');
  }

  const { query, options: cleanOptions } = await getQueryAndOptions(
    config,
    identifier,
    options,
  );

  let member = fromDB(
    {
      includeLegacyFields: cleanOptions.legacy,
    },
    await query.where('store', 'like', `%${cleanEmail(identifier.email)}%`),
  );

  if (!member && config?.interfaces?.getUserByEmail) {
    const userUid = await config.interfaces
      .getUserByEmail(identifier.email)
      .then((u) => (u ? u.uid : null));

    member = userUid
      ? await get(config, { ...identifier, userUid }, options)
      : null;
  }

  if (!member && cleanOptions.throwOnNotFound) {
    throw new NotFound('member not found');
  }

  if (member && cleanOptions.detailed) {
    await decorateWithDetailed(config, member);
  }

  return member;
}

get.byEmail = getByEmail;

export default get;

export { getByEmail as byEmail };
