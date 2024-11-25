import _ from 'lodash';
import { BadRequest } from '@openagenda/verror';
import validateNav from '../../validators/nav.js';
import validateQuery from '../../validators/query.js';
import validateOptions from '../../validators/options.js';
import queryToDSL from './queryToDSL.js';

export default async (
  { alias, client, cleanIndexedAgenda },
  query,
  nav,
  options,
) => {
  const inflatedQuery = Object.keys(query || {}).length
    ? validateQuery(
      Object.keys(query).reduce(
        (inflated, key) => _.set(inflated, key.split('.'), query[key]),
        {},
      ),
    )
    : null;

  const cleanNav = validateNav(nav);
  const cleanOptions = validateOptions(options);

  const DSL = queryToDSL(inflatedQuery, cleanNav, cleanOptions);

  const { result, error } = await client
    .search({
      index: alias,
      body: DSL,
    })
    .then(
      (r) => ({ result: r }),
      (e) => ({ error: e }),
    );

  if (
    (error?.meta?.body.error.caused_by.reason ?? '').includes('search_after')
  ) {
    throw new BadRequest('Provided after value is invalid');
  } else if (error) {
    throw error;
  }

  return {
    after: _.last(result.body.hits.hits)?.sort,
    sort: cleanNav.sort,
    agendas: result.body.hits.hits
      .map((hit) => hit._source)
      .map((agenda) => cleanIndexedAgenda(agenda, cleanOptions)),
    total: result.body.hits.total.value,
  };
};
