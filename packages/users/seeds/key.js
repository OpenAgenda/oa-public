'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  // Deletes ALL existing entries
  await knex(schemas.key).del();

  await knex(schemas.key).insert([
    {
      id: '4',
      type: 'userPrivate',
      identifier: '75052324',
      label: null,
      key: '595e0074271c880b6a69fc59303a310f',
      created_at: '2017-08-01 14:54:49',
    },
    {
      id: '5',
      type: 'userPublic',
      identifier: '99999999',
      label: null,
      key: '317e316466a629c8dacd4aa81f39c930',
      created_at: '2017-08-01 14:54:49',
    },
    {
      id: '6',
      type: 'userPublic',
      identifier: '27639980',
      label: null,
      key: '19c1e464984b192228c39d2619d8690c',
      created_at: '2017-08-01 14:54:49',
    },
  ]);
};
