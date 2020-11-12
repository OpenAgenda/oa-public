'use strict';

const {
  knex,
  resetAndCreateTables
} = require('./sql');

const raw = resetAndCreateTables();

raw.push(knex('review').insert([{
  id: 1,
  title: 'Ville d\'Arles',
  slug: 'arles',
  owner_id: 1,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  uid: 1
}]));

raw.push(knex('network').insert([{
  id: 1,
  uid: 1,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  title: 'Un réseau'
}]));

raw.push(knex('user').insert([{
  id: 1,
  uid: 1,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  full_name: 'Janine P.',
  password: 'xxx',
  salt: 'xxx'
}]));

raw.push(knex('location').insert([{
  id: 1,
  slug: 'la-boutique',
  placename: 'La boutique',
  placename: 'La boutique',
  address: '29 passage du ponceau, Paris',
  latitude: 48.867583,
  longitude: 2.3502635,
  created_at: '2016-01-11 13:07:08',
  updated_at: '2016-01-18 16:14:06',
  uid: 1
}]));

raw.push(knex('event_2').insert([{
  id: 1,
  owner_uid: 1,
  agenda_uid: 1,
  slug: 'event-1',
  uid: 1,
  title: JSON.stringify({
    fr: 'Evénement 1'
  }),
  description: JSON.stringify({
    fr: 'Description 1'
  }),
  long_description: JSON.stringify({
    fr: 'Description longue 1'
  }),
  timings: JSON.stringify([{
    begin: new Date('2019-09-27T10:00:00+0200'),
    end: new Date('2019-09-27T12:00:00+0200')
  }]),
  timezone: 'Europe/Paris',
  location_uid: 1,
  created_at: new Date(),
  updated_at: new Date()
}, {
  id: 2,
  owner_uid: 1,
  agenda_uid: 1,
  slug: 'event-2',
  uid: 2,
  title: JSON.stringify({
    fr: 'Evénement 2'
  }),
  description: JSON.stringify({
    fr: 'Description 2'
  }),
  long_description: JSON.stringify({
    fr: 'Description longue 2'
  }),
  timezone: 'Europe/Paris', 
  timings: JSON.stringify([{
    begin: new Date('2019-09-27T10:00:00+0200'),
    end: new Date('2019-09-27T12:00:00+0200')
  }]),
  location_uid: 1,
  created_at: new Date(),
  updated_at: new Date()
}]));

raw.push(knex('agenda_event').insert([{
  id: 1,
  user_uid: 1,
  agenda_uid: 1,
  event_uid: 1,
  state: 2,
  created_at: new Date(),
  updated_at: new Date()
}, {
  id: 2,
  user_uid: 1,
  agenda_uid: 1,
  event_uid: 2,
  state: 0,
  created_at: new Date(),
  updated_at: new Date()
}]));

module.exports = raw.join(';\n') + ';';
