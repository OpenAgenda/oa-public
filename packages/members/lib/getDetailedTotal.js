import getRoleSlug from '../iso/getRoleSlug.js';

/**
 * Get detailed total count by role
 * @param {Object} query - Knex query builder
 * @param {Object} knex - Knex instance
 * @returns {Promise<Object>} Detailed total count result
 */
export default function getDetailedTotal(query, knex) {
  return query
    .select(knex.raw('credential as role, count( id ) as total'))
    .groupBy('role')
    .then((rows) =>
      rows.reduce(
        ({ total, totalPerRole }, row) => {
          const roleSlug = getRoleSlug(row.role);
          return {
            totalPerRole: {
              ...totalPerRole,
              [roleSlug]: (totalPerRole[roleSlug] ?? 0) + row.total,
            },
            total: total + row.total,
          };
        },
        {
          total: 0,
          totalPerRole: {},
        },
      ));
}
