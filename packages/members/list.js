import logs from '@openagenda/logs';
import addListFilters from './lib/addListFilters.js';
import { fromDB } from './lib/transformDBEntry.js';
import cleanListOptions from './lib/cleanListOptions.js';
import addPaginationAndOrder from './lib/addPaginationAndOrder.js';
import getTotal from './lib/getTotal.js';
import decorateMembersWithUsers from './lib/decorateMembersWithUsers.js';
import decorateMembersWithAgendas from './lib/decorateMembersWithAgendas.js';
import decorateMembersWithEventCounts from './lib/decorateMembersWithEventCounts.js';

const log = logs('list');

/**
 * List members with optional filtering, pagination, and decoration
 * @param {Object} config - Configuration object with knex, schema, and interfaces
 * @param {Object} query - Query parameters
 * @param {Object} nav - Navigation parameters (pagination, ordering)
 * @param {Object} options - Additional options
 * @returns {Promise<Object|Array>} Members list with optional metadata
 */
export default async (
  { knex, schema, interfaces },
  query,
  nav = {},
  options = {},
) => {
  log('processing', { query, nav, options });

  const {
    detailed,
    total: includeTotal,
    legacy,
    userOptions,
    customDataAtRoot,
  } = cleanListOptions(options);

  const queryBuilder = knex(schema);

  addListFilters(queryBuilder, query);

  const { total, totalPerRole } = await getTotal(
    knex,
    queryBuilder,
    includeTotal,
    detailed,
  );

  const { orderField } = addPaginationAndOrder(queryBuilder, nav);

  const members = await queryBuilder.then((rows) =>
    rows.map(
      fromDB.bind(null, {
        includeLegacyFields: legacy,
        orderField,
        customDataAtRoot,
      }),
    ));

  // Initialize event counts for detailed mode
  if (detailed) {
    members.forEach((member) => {
      member.eventCount = 0;
    });
  }

  // Decorate members with additional data if in detailed mode
  const shouldDecorateMembers = detailed && members.length;

  if (shouldDecorateMembers && interfaces?.getUsersByUid) {
    await decorateMembersWithUsers(interfaces, members, userOptions);
  }

  if (shouldDecorateMembers && interfaces?.getAgendasByUid) {
    await decorateMembersWithAgendas(interfaces, members);
  }

  if (shouldDecorateMembers && interfaces?.getEventCountByUserUid) {
    await decorateMembersWithEventCounts(interfaces, members, query.agendaUid);
  }

  // Build and return the result
  if (includeTotal || legacy) {
    const result = {
      [legacy ? 'stakeholders' : 'members']: members,
    };

    if (total !== undefined) {
      result.total = total;
    }

    if (totalPerRole) {
      result.totalPerRole = totalPerRole;
    }

    return result;
  }

  return members;
};
