import * as sUtils from './lib/utils.js';

async function remove({ knex, schemas, service, interfaces }, identifiers) {
  const v = {
    identifiers: sUtils.identifiers.clean(identifiers),
    agenda: null,
    success: null,
  };

  await sUtils.identifiers.check(v);

  // Get the agenda
  v.agenda = await service.get(v.identifiers, {
    internal: true,
    private: null,
  });

  // Call beforeRemove hook if it exists
  if (interfaces?.beforeRemove && v.agenda) {
    await new Promise((resolve, reject) => {
      interfaces.beforeRemove(v.agenda, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  // Perform the actual removal
  if (v.agenda) {
    const removedRows = await knex(schemas.agenda)
      .where('id', v.agenda.id)
      .update({
        deleted_at: new Date(),
        updated_at: new Date(),
      });
    v.success = !!removedRows;
  }

  // Call onRemove hook if removal was successful
  if (v.success && interfaces?.onRemove) {
    interfaces.onRemove(v.agenda);
  }

  return {
    success: v.success,
  };
}

export default remove;
