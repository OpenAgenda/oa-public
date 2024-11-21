import _ from 'lodash';
import VError from '@openagenda/verror';

export default async (ctl, knex, agendaId) => {
  const storeStr = _.get(
    await knex('category_set').first('store').where('id', agendaId),
    'store',
  );

  if (!storeStr) return;

  let store;

  try {
    store = JSON.parse(storeStr);
  } catch (e) {
    throw new VError(
      e,
      'could not parse category set of agenda of id',
      agendaId,
    );
  }

  ctl.ct = _.get(store, 'categories', []).map((c) => ({
    s: c.slug,
    c: c.label,
  }));
};
