'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  // Deletes ALL existing entries
  await knex(schemas.feed_notification).del();

  await knex(schemas.feed_notification).insert([
    {
      'id': 1,
      'feed_id': 2,
      'verb': 'event.create',
      'group_by': 'target:agenda:48648352',
      'store': '{"actor":["user:45645612"],"object":["event:98798765"],"target":["agenda:48648352"],"labels":{"actor":"Sonny","object":"Réunion des junkies anonymes","target":"Apéro du matin"}}',
      'state': 0,
      'created_at': '2017-05-02 18:08:22',
      'updated_at': '2017-05-02 18:08:22',
    },
    {
      'id': 2,
      'feed_id': 2,
      'verb': 'event.create',
      'group_by': 'target:agenda:48648353',
      'store': '{"actor":["user:45645613"],"object":["event:99798765"],"target":["agenda:58648352"],"labels":{"actor":"JP","object":"Visite d\'OpenAgenda","target":"Visites chez les géants"}}',
      'state': 2,
      'created_at': '2017-06-02 07:08:22',
      'updated_at': '2017-06-02 07:08:22',
    },
    {
      'id': 3,
      'feed_id': 2,
      'verb': 'event.update',
      'group_by': 'target:agenda:48648353',
      'store': '{"actor":["user:45645613"],"object":["event:99798765"],"target":["agenda:58648352"],"labels":{"actor":"JP","object":"Visite d\'OpenAgenda","target":"Visites chez les géants"}}',
      'state': 0,
      'created_at': '2017-06-02 07:10:22',
      'updated_at': '2017-06-02 07:10:22',
    },
    {
      'id': 4,
      'feed_id': 2,
      'verb': 'event.update',
      'group_by': 'target:agenda:48648354',
      'store': '{"actor":["user:45645614"],"object":["event:99798766"],"target":["agenda:58648353"],"labels":{"actor":"Kaore","object":"Visite d\'OpenAgenda v2","target":"Visites chez les géants du web 2017"}}',
      'state': 0,
      'created_at': '2017-06-02 07:10:22',
      'updated_at': '2017-06-02 07:10:22',
    },
    {
      'id': 5,
      'feed_id': 2,
      'verb': 'agenda.changeEventState',
      'group_by': 'target:agenda:66666666|store.newState:2',
      'store': '{"actor":["user:12312312"],"object":["event:78978999"],"target":["agenda:66666666"],"labels":{"actor":"Jacky","object":"Réunion des junkies anonymes 2","target":"La fumette"},"newState":2}',
      'state': 0,
      'created_at': '2017-06-06 09:25:43',
      'updated_at': '2017-06-06 09:25:43',
    },
  ]);
};
