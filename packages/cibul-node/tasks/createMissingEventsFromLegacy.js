'use strict';

const { promisify } = require('util');
const log = require('@openagenda/logs')('createMissingEventsFromLegacy');

module.exports = async (config, services) => {

  const transfers = {
    event: uid => promisify(services.events.legacy.transfer)({ uid })
  };

  try {
    let lastId = 0;

    const counts = {
      checked: 0,
      notOnNew: 0,
      notOnNewButSlugTaken: 0
    };

    const db = config.knex;

    do {
      const events = await db('event').select(['id', 'uid', 'slug'])
        .where('created_at', '>', '2019-01-01')
        .where('id', '>', lastId)
        .limit(100);

      for (const event of events) {
        const event2 = await db('event_2').first('id')
          .where('uid', event.uid);

        counts.checked++;

        if (event2) {
          continue;
        }

        counts.notOnNew++;

        const slugIsTaken = !!(await db('event_2').first('id')
          .where('slug', event.slug));

        if (slugIsTaken) {
          counts.notOnNewButSlugTaken++;
          const suffix = '_' + Math.floor(Math.random()*100000);
          await db('event').update({
            slug: event.slug + suffix
          }).where('id', event.id);

          console.log('slug %s was taken, changed to %s', event.slug, event.slug + suffix);
          event.slug =  event.slug + suffix;
        }

        const eventTransferResult = await transfers.event(event.uid);

        if (!eventTransferResult.created) {
          throw new Error(result);
        }

        for (const ra of await db('review_article').select('id').where('event_id', event.id)) {
          const refTransferResult = await services.agendaEvents.legacyTransfer(ra.id);
          if (!(refTransferResult.created) && (refTransferResult.code !== 'already.exists')) {
            console.log(refTransferResult);
            throw new Error('STOOP');
          } else if (refTransferResult.code !== 'already.exists') {
            console.log(`https://openagenda.com/agendas/${refTransferResult.created.agendaUid}/events/${event.uid}`);
          }
        }

      }

      log('checked: %s - not on new: %s, not on new because slug is taken: %s',
        counts.checked,
        counts.notOnNew,
        counts.notOnNewButSlugTaken
      );

      lastId = events.length ? events.pop().id : -1;
    } while (lastId !== -1);
  } catch(e) {
    log('error', e);
  }

}
