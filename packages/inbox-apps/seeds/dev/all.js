"use strict";

const { promisify } = require( 'util' );
const fixtures = require( '@openagenda/fixtures' );
const inboxes = require( '@openagenda/inboxes' );

exports.seed = async knex => {
  const { testconfig } = knex.client.config;

  fixtures.init( testconfig );

  await promisify( fixtures )( [], { reset: true } );

  await inboxes.init( testconfig );

  await promisify( fixtures )( [ {
    table: testconfig.schemas.inbox,
    src: __dirname + '/inbox.data.sql'
  }, {
    table: testconfig.schemas.inboxUser,
    src: __dirname + '/inbox_user.data.sql'
  }, {
    table: testconfig.schemas.conversation,
    src: __dirname + '/conversation.data.sql'
  }, {
    table: testconfig.schemas.inboxConversation,
    src: __dirname + '/inbox_conversation.data.sql'
  }, {
    table: testconfig.schemas.message,
    src: __dirname + '/message.data.sql'
  } ], { reset: false } );
};
