import getSchema from './getSchema.mjs';
import UpdateSchemaFields from './updateSchemaFields.mjs';
import getAgendas from './getAgendas.mjs';
import addAgenda from './addAgenda.mjs';
import removeAgenda from './removeAgenda.mjs';
import get from './get.mjs';

export default core => {
  const updateSchemaFields = UpdateSchemaFields(core);

  return Object.assign(networkUid => ({
    get: get.bind(null, core, networkUid),
    schema: {
      get: getSchema.bind(null, core, networkUid),
      updateFields: updateSchemaFields.bind(null, networkUid),
    },
    agendas: Object.assign(getAgendas.bind(null, core.services, networkUid), {
      add: addAgenda.bind(null, core, networkUid),
      create: (data, options = {}) => core.agendas.create({ ...data, networkUid }, { ...options, updateLegacy: true }),
      remove: removeAgenda.bind(null, core, networkUid),
    }),
  }), {
    list: () => core.services.networks.list(),
    create: data => core.services.networks.create(data),
  });
};
