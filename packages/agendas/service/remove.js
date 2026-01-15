import * as sUtils from './lib/utils.js';

async function _get({ service }, v) {
  v.agenda = await service.get(v.identifiers, {
    internal: true,
    private: null,
  });
  return v;
}

async function _doRemove({ knex, schemas }, v) {
  if (!v.agenda) {
    return v;
  }

  const removedRows = await knex(schemas.agenda).where('id', v.agenda.id).del();

  v.success = !!removedRows;
  return v;
}

async function _before({ interfaces }, v) {
  if (!interfaces || !interfaces.beforeRemove || !v.agenda) {
    return v;
  }

  return new Promise((rs, rj) => {
    interfaces.beforeRemove(v.agenda, (err) => {
      if (err) return rj(err);
      rs(v);
    });
  });
}

async function remove({ knex, schemas, service, interfaces }, identifiers) {
  const v = {
    identifiers: sUtils.identifiers.clean(identifiers),
    agenda: null,
    success: null,
  };

  await sUtils.identifiers.check(v);
  await _get({ service }, v);
  await _before({ interfaces }, v);
  await _doRemove({ knex, schemas }, v);

  if (v.success && interfaces && interfaces.onRemove) {
    interfaces.onRemove(v.agenda);
  }

  return {
    success: v.success,
  };
}

export default remove;
