/**
 * Get simple total count of members
 * @param {Object} query - Knex query builder
 * @returns {Promise<Object>} Total count result
 */
export default function getSimpleTotal(query) {
  return query.count('id as total').then((result) => ({
    total: result[0]?.total ?? null,
    totalPerRole: null,
  }));
}
