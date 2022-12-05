'use strict';

const _ = require('lodash');
const { NotFound } = require('@openagenda/verror');
const cleanGetOptions = require('./lib/cleanGetOptions');
const { fromDB } = require('./lib/transformDBEntry');

async function _decorateWithDetailed({ interfaces }, member) {
  if (!member.userUid) {
    return;
  }

  if (interfaces.getUsersByUid) {
    member.user = _.first(await interfaces.getUsersByUid([member.userUid]));
  }
}

function _getQueryAndOptions({ knex, schema }, identifier, options = {}) {
  const cleanOptions = cleanGetOptions(options);

  const where = _.isObject(identifier)
    ? _.mapKeys(_.pick(identifier, ['userUid', 'agendaUid', 'id']), (v, k) =>
      _.snakeCase(k))
    : { id: identifier };

  return {
    query: knex(schema)
      .first(
        [
          'id',
          'agenda_uid',
          'credential',
          'user_uid',
          'store',
          'deleted_user',
          'actions_counter',
          'updated_at',
        ].concat(cleanOptions.legacy ? ['user_id', 'review_id'] : []),
      )
      .where(where),
    options: cleanOptions,
  };
}

async function get(config, identifier, options = {}) {
  const { query, options: cleanOptions } = _getQueryAndOptions(
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
    await _decorateWithDetailed(config, member);
  }

  return member;
}

async function getByEmail(config, identifier, options = {}) {
  if (!_.isObject(identifier)) {
    throw new Error(
      'Bad request: identifier must be an object containing at least an email and another identifier',
    );
  } else if (!identifier.email) {
    throw new Error('Bad request: email is missing in identifier');
  }

  const { query, options: cleanOptions } = await _getQueryAndOptions(
    config,
    identifier,
    options,
  );

  let member = fromDB(
    {
      includeLegacyFields: cleanOptions.legacy,
    },
    await query.where('store', 'like', `%${identifier.email}%`),
  );

  if (!member && _.get(config, 'interfaces.getUserByEmail')) {
    const userUid = await config.interfaces
      .getUserByEmail(identifier.email)
      .then(u => (u ? u.uid : null));

    member = userUid
      ? await get(config, { ...identifier, userUid }, options)
      : null;
  }

  if (!member && cleanOptions.throwOnNotFound) {
    throw new NotFound('member not found');
  }

  if (member && cleanOptions.detailed) {
    await _decorateWithDetailed(config, member);
  }

  return member;
}

module.exports = Object.assign(get, {
  byEmail: getByEmail,
});
