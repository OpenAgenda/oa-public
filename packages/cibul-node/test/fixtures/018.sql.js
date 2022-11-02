'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const load = loadObjectFromFile({ cwd: __dirname });

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const insertEventSet = require('./sql/eventSets');

const raw = resetAndCreateTables();

raw.push(knex('user').insert([
  load('sql/users/jean-benoit.json'),
  load('sql/users/steevie.json', {
    id: 1002,
    uid: 8929606
  })
]));

raw.push(knex('review').insert([
  load('sql/agendas/fetedelamusique.json')
]));

raw.push(knex('reviewer').insert([
  load('sql/members/jean-benoit-fetedelamusique.json')
]));

raw.push(knex('api_key_set').insert([
  load('sql/apiKeySets/01.json', { user_id: 1002 })
]));

insertEventSet(knex, raw, 'wildAtHeart', {
  event: {
    creator_uid: {
      $set: 99999967
    },
    owner_uid: {
      $set: 99999967
    }
  },
  agendaEvents: [{
    agenda_uid: {
      $set: 6184770
    }
  }]
});

const activitySet = load('sql/activitySets/01.json');

raw.push(knex('activity').insert(activitySet.activities));

raw.push(knex('activity_feed').insert(activitySet.feeds));

raw.push(knex('activity_feed_activity').insert(activitySet.feedActivities));

module.exports = `${raw.join(';\n')};`;
