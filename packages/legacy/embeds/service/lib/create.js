import serialize from 'locutus/php/var/serialize.js';
import { NotFound } from '@openagenda/verror';
import defineUnique from '@openagenda/utils/knex/defineUnique.js';
import validate from './validate.js';

export default ({ interfaces, knex }, agendaUid) =>
  async (data = {}) => {
    const agendaId = await interfaces.getAgendaId(agendaUid);
    if (!agendaId) {
      throw new NotFound('agenda id not found for uid %d', agendaUid);
    }
    const uid = await defineUnique(knex, 'review_embed', 'uid', () =>
      Math.ceil(Math.random() * 99999999));
    const { template, config } = validate(data);

    await knex('review_embed').insert({
      review_id: agendaId,
      owner_id: 1,
      uid,
      created_at: new Date(),
      updated_at: new Date(),
      store: serialize(config),
      template: JSON.stringify(template),
      mapping: null,
    });

    return {
      uid,
      agendaUid,
      config,
    };
  };
