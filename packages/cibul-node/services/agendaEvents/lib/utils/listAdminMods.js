"use strict";

module.exports = (membersSvc, agendaUid) => new Promise(
  ( rs, rj ) => {
    const stream = membersSvc.stream( {
      agendaUid,
      role: ['administrator', 'moderator' ],
      withUser: true
    }, {}, { detailed: true } );

    const members = [];

    stream.on( 'data', member => {
      members.push( member );
    } );
    stream.on( 'end', () => {
      rs( members );
    } );
    stream.on( 'error', rj );
  }
);
