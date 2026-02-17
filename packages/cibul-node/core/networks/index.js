import getSchema from './getSchema.js';
import getSchemaAndParents from './getSchemaAndParents.js';
import UpdateSchemaFields from './updateSchemaFields.js';
import getAgendas from './getAgendas.js';
import addAgenda from './addAgenda.js';
import removeAgenda from './removeAgenda.js';
import get from './get.js';

export default (core) => {
  const updateSchemaFields = UpdateSchemaFields(core);

  return Object.assign(
    (networkUid) => ({
      get: get.bind(null, core, networkUid),
      schema: {
        get: getSchema.bind(null, core, networkUid),
        getAndParents: getSchemaAndParents.bind(null, core, networkUid),
        updateFields: updateSchemaFields.bind(null, networkUid),
      },
      agendas: Object.assign(getAgendas.bind(null, core.services, networkUid), {
        add: addAgenda.bind(null, core, networkUid),
        create: (data, options = {}) =>
          core.agendas.create({ ...data, networkUid }, { ...options }),
        remove: removeAgenda.bind(null, core, networkUid),
      }),
    }),
    {
      list: () => core.services.networks.list(),
      create: (data) => core.services.networks.create(data),
    },
  );
};
