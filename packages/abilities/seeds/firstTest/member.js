'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  // Deletes ALL existing entries
  await knex( schemas.member ).del();

  return knex( schemas.member ).insert( [
    {
      id: "2436",
      user_id: "1",
      review_id: "218",
      credential: "2",
      created_at: "2014-01-27 02:52:21",
      updated_at: "2017-03-15 10:32:02",
      store:
        '{"custom_fields":{"contact_number":"06","contact_name":"Kaor\u00e9 - OpenAgenda","email":"kaore@openagenda.com"}}',
      organization: "",
      creator_id: null,
      deleted_user: "0",
      actions_counter: "15"
    },
    {
      id: "6696",
      user_id: "2",
      review_id: "218",
      credential: "3",
      created_at: "0000-00-00 00:00:00",
      updated_at: "2018-04-27 06:03:35",
      store: '{"custom_fields":{"contact_name":"Romain Lange - OpenAgenda"}}',
      organization: null,
      creator_id: null,
      deleted_user: "0",
      actions_counter: "7"
    },
    {
      id: "32798",
      user_id: "15453",
      review_id: "218",
      credential: "2",
      created_at: "0000-00-00 00:00:00",
      updated_at: "0000-00-00 00:00:00",
      store: '{"custom_fields":{"contact_name":"Yacine Bensalem - OpenAgenda"}}',
      organization: null,
      creator_id: "1",
      deleted_user: "0",
      actions_counter: "2"
    },
    {
      id: "60813",
      user_id: null,
      review_id: "218",
      credential: "1",
      created_at: "2017-06-20 10:14:46",
      updated_at: "2017-11-13 17:04:57",
      store: '{"custom_fields":{"email":"jeff@oa.co","contact_name":"Francis"}}',
      organization: null,
      creator_id: null,
      deleted_user: "0",
      actions_counter: "0"
    },
    {
      id: "60815",
      user_id: "11258",
      review_id: "218",
      credential: "2",
      created_at: "2017-06-20 10:15:18",
      updated_at: "2018-09-24 10:10:03",
      store:
        '{"custom_fields":{"organization":"OpenAgenda","contact_number":"0608915022","contact_name":"K\u00e9vin Berthommier - OpenAgenda","contact_position":"Dev","email":"kevin.bertho@gmail.com"}}',
      organization: "openagenda",
      creator_id: null,
      deleted_user: "0",
      actions_counter: "8"
    },
    {
      id: "119157",
      user_id: null,
      review_id: "218",
      credential: "1",
      created_at: "2018-08-10 12:13:52",
      updated_at: "2018-08-10 12:13:52",
      store: '{"custom_fields":{"email":"urruheke-4548@yopmail.com"}}',
      organization: null,
      creator_id: null,
      deleted_user: "0",
      actions_counter: "0"
    },
    {
      id: "119213",
      user_id: "11",
      review_id: "218",
      credential: "2",
      created_at: "2018-09-24 10:07:57",
      updated_at: "2018-09-24 10:07:57",
      store:
        '{"custom_fields":{"email":"pacristofini@gmail.com","contact_name":"Cristofini Pierre-Antoine"}}',
      organization: null,
      creator_id: null,
      deleted_user: "0",
      actions_counter: "0"
    }
  ] );
};
