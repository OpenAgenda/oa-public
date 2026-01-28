import cleanGetOptions from './cleanGetOptions.js';

/**
 * Get query and options for member retrieval
 * @param {Object} config - Configuration object with knex and schema
 * @param {*} identifier - Member identifier (object or ID)
 * @param {Object} options - Additional options
 * @returns {Object} Query and cleaned options
 */
export default function getQueryAndOptions(
  { knex, schema },
  identifier,
  options = {},
) {
  const cleanOptions = cleanGetOptions(options);

  const where = typeof identifier === 'object'
    && identifier !== null
    && !Array.isArray(identifier)
    ? Object.fromEntries(
      Object.entries(identifier)
        .filter(([key]) => ['userUid', 'agendaUid', 'id'].includes(key))
        .map(([key, value]) => [
          key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
          value,
        ]),
    )
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
