"use strict";

const userRouter = require( './user.back' );
const agendaRouter = require( './agenda.back' );
const supportRouter = require( './support.back' );

module.exports = parentApp => parentApp
  .use( '/agendas/:agendaUid/inbox', agendaRouter )
  .use( '/home/inbox', userRouter )
  .use( '/admin/support', supportRouter );
