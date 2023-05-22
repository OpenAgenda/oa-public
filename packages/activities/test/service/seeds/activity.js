'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  // Deletes ALL existing entries
  await knex(schemas.activity).del();

  await knex(schemas.activity).insert([
    {
      'id': 1,
      'actor': 'user:54849455',
      'verb': 'event.create',
      'object': 'event:54548512',
      'target': 'agenda:48648352',
      'store': JSON.stringify({
        'labels': {
          'actor': 'Jacky',
          'object': 'Réunion des junkies anonymes',
          'target': 'la-gargouille',
        },
      }),
      'created_at': '2017-03-27 14:15:09',
    },
    {
      'id': 2,
      'actor': 'user:99999999',
      'verb': 'event.delete',
      'object': 'event:54548512',
      'target': 'agenda:48648352',
      'store': JSON.stringify({
        'labels': {
          'actor': 'Jacky',
          'object': 'Réunion des junkies anonymes',
          'target': 'la-gargouille',
        },
      }),
      'created_at': '2017-03-27 14:15:09',
    },
    {
      'id': 3,
      'actor': 'user:99999950',
      'verb': 'event.action',
      'object': 'event:54548512',
      'target': 'agenda:48648352',
      'store': JSON.stringify({
        'labels': {
          'actor': 'Jacky',
          'object': 'Réunion des junkies anonymes',
          'target': 'la-gargouille',
        },
      }),
      'created_at': '2017-03-27 14:15:09',
    },
    {
      'id': 4,
      'actor': 'user:99999951',
      'verb': 'event.delete',
      'object': 'event:54548512',
      'target': 'agenda:48648352',
      'store': JSON.stringify({
        'labels': {
          'actor': 'Jacky',
          'object': 'Réunion des junkies anonymes',
          'target': 'la-gargouille',
        },
      }),
      'created_at': '2017-03-27 14:15:09',
    },
    {
      'id': 5,
      'actor': 'user:99999952',
      'verb': 'event.action',
      'object': 'event:54548512',
      'target': 'agenda:48648352',
      'store': JSON.stringify({
        'labels': {
          'actor': 'Jacky',
          'object': 'Réunion des junkies anonymes',
          'target': 'la-gargouille',
        },
      }),
      'created_at': '2017-03-27 14:15:09',
    },
    {
      'id': 6,
      'actor': 'user:99999953',
      'verb': 'event.action',
      'object': 'event:54548513',
      'target': 'agenda:48648352',
      'store': JSON.stringify({
        'labels': {
          'actor': 'Jacky',
          'object': 'Réunion des junkies anonymes',
          'target': 'la-gargouille',
        },
      }),
      'created_at': '2017-03-27 14:15:09',
    },
    {
      'id': 7,
      'actor': 'user:99999954',
      'verb': 'event.delete',
      'object': 'event:54548512',
      'target': 'agenda:48648352',
      'store': JSON.stringify({
        'labels': {
          'actor': 'Jacky',
          'object': 'Réunion des junkies anonymes',
          'target': 'la-gargouille',
        },
      }),
      'created_at': '2017-03-27 14:15:09',
    },
    {
      'id': 8,
      'actor': 'user:1234',
      'verb': 'event.create',
      'object': 'event:5678',
      'target': 'agenda:9012',
      'store': JSON.stringify({
        'labels': {
          'actor': 'Kevin',
          'object': 'Va au Starbucks',
          'target': 'le-mercure',
        },
      }),
      'created_at': '2022-06-08 10:38',
    },
    {
      'id': 9,
      'actor': 'user:1234',
      'verb': 'event.update',
      'object': 'event:5678',
      'target': 'agenda:9012',
      'store': JSON.stringify({
        'labels': {
          'actor': 'Kevin',
          'object': 'Boit son jus de chaussettes',
          'target': 'le-mercure',
        },
      }),
      'created_at': '2022-06-08 10:45',
    },
    {
      'id': 10,
      'actor': 'user:1234',
      'verb': 'event.create',
      'object': 'event:4546',
      'target': 'agenda:3453',
      'store': JSON.stringify({
        'labels': {
          'actor': 'Kevin',
          'object': 'Prend le train',
          'target': 'le-train',
        },
      }),
      'created_at': '2022-06-08 09:20',
    },
    {
      'id': 11,
      'actor': 'user:789789',
      'verb': 'account.update',
      'object': 'email',
      'target': 'user:1234',
      'store': JSON.stringify({
        'labels': {
          'actor': 'Rohim',
          'object': 'Email',
          'target': 'Kevin',
        },
      }),
      'created_at': '2022-06-08 11:30',
    },
    {
      'id': 12,
      'actor': 'user:789789',
      'verb': 'agenda.sendInvitation',
      'object': 'email:aogendo@oagenda.com',
      'target': 'agenda:3453',
      'store': JSON.stringify({
        'labels': {
          'actor': null,
          'object': 'aogendo@oagenda.com',
          'target': 'Un agenda contributif',
        },
        'credential': 1,
      }),
      'created_at': '2022-06-08 10:22',
    },
  ]);
};
