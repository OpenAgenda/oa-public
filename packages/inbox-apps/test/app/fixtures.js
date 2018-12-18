"use strict";

require( '@babel/register' )

const wn = require( 'when/node' );
// const path = require( 'path' );
const fixtures = require( '@openagenda/fixtures' );
const inboxes = require( '@openagenda/inboxes/test/service' );
const config = require( '../../testconfig.js' );

fix().catch( console.error );

async function fix() {

  try {

    fixtures.init( config );

    // migrate to latest
    await inboxes.initAndLoad( {
      ...config,
      migrations: {
        tableName: 'inbox_migrations'
      }
    }, [] );

    await wn.call( fixtures, [ {
      table: config.schemas.inbox,
      src: __dirname + '/../fixtures/inbox.data.sql'
    }, {
      table: config.schemas.inboxUser,
      src: __dirname + '/../fixtures/inbox_user.data.sql'
    }, {
      table: config.schemas.conversation,
      src: __dirname + '/../fixtures/conversation.data.sql'
    }, {
      table: config.schemas.inboxConversation,
      src: __dirname + '/../fixtures/inbox_conversation.data.sql'
    }, {
      table: config.schemas.message,
      src: __dirname + '/../fixtures/message.data.sql'
    } ], { reset: false } );

  } catch ( e ) {

    console.error( e );
    process.exit( 1 );

  }

}
