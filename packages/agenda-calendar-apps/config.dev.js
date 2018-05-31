"use strict";

const layout = require( 'fs' ).readFileSync( __dirname + '/index.html', 'utf-8' );

module.exports = {
  layout: ( req, content ) => {

    return layout.replace( '<%- content %>', content );

  },
  res: {
    agenda: 'https://d.openagenda.com/agendas/{agendaUid}',
    search: 'https://d.openagenda.com/agendas/{agendaUid}/events.v2.json',
    event: 'https://d.openagenda.com/agendas/{agendaUid}/events/{eventUid}'
  }
}