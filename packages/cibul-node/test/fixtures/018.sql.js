import seedApiKeys from './seedApiKeys.js';
import load from './loadObjectFromFile.js';
import insertEventSet from './sql/eventSets/index.js';

export default async (knex) => {
  await knex('user').insert([
    load('sql/users/jean-benoit.json'),
    load('sql/users/steevie.json', {
      id: 1002,
      uid: 8929606,
    }),
  ]);

  await knex('review').insert([load('sql/agendas/fetedelamusique.json')]);

  await knex('reviewer').insert([
    load('sql/members/jean-benoit-fetedelamusique.json'),
  ]);

  await seedApiKeys(knex, [
    load('sql/apiKeys/01-pk.json', { userUid: 8929606 }),
    load('sql/apiKeys/01-sk.json', { userUid: 8929606 }),
  ]);

  await insertEventSet(knex, 'wildAtHeart', {
    event: {
      creator_uid: {
        $set: 99999967,
      },
      owner_uid: {
        $set: 99999967,
      },
    },
    agendaEvents: [
      {
        agenda_uid: {
          $set: 6184770,
        },
      },
    ],
  });

  const activitySet = load('sql/activitySets/01.json');

  await knex('activity').insert(activitySet.activities);

  await knex('activity_feed').insert(activitySet.feeds);

  await knex('activity_feed_activity').insert(activitySet.feedActivities);
};
