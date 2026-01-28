import getSimpleTotal from './getSimpleTotal.js';
import getDetailedTotal from './getDetailedTotal.js';

/**
 * Get total member counts
 * @param {Object} knex - Knex instance
 * @param {Object} queryBuilder - Knex query builder
 * @param {boolean} includeTotal - Whether to include total counts
 * @param {boolean} detailed - Whether to include detailed role counts
 * @returns {Promise<Object>} Total count results
 */
export default async function getTotal(
  knex,
  queryBuilder,
  includeTotal = false,
  detailed = false,
) {
  if (!includeTotal) {
    return {
      total: null,
      totalPerRole: null,
    };
  }

  const query = queryBuilder.clone();

  return detailed ? getDetailedTotal(query, knex) : getSimpleTotal(query);
}
