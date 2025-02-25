import serialize from 'locutus/php/var/serialize.js';
import logs from '@openagenda/logs';
import get from './get.js';
import validate from './validate.js';

const log = logs('update');

export default ({ interfaces, knex }, agendaUid) =>
  async (uid, data = {}) => {
    const embed = await get({ interfaces, knex }, agendaUid, uid, {
      includeId: true,
      throwIfNotFound: true,
    });

    log('updating with %j', data);
    const { template, config } = validate(data);
    await knex('review_embed')
      .update({
        store: serialize(config),
        template: JSON.stringify(template),
        updated_at: new Date(),
      })
      .where({
        id: embed.id,
      });

    log('update successful');

    return {
      uid,
      agendaUid,
      template,
      config,
    };
  };
