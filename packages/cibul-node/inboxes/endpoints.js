"use strict";

const userRouter = require( './user' );
const agendaRouter = require( './agenda' );
const supportRouter = require( './support' );

module.exports = parentApp => parentApp
  .use( '/agendas/:agendaUid/inbox', agendaRouter )
  .use( '/home/inbox', userRouter )
  .use( '/admin/support', supportRouter );
