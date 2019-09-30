'use strict';

const should = require( 'should' );
const sinon = require( 'sinon' );
const moment = require( 'moment' );
const { agenda, event } = require('./fixtures/99_event_ics');
const toIcs = require('../services/events/lib/ics');

describe('event ics', () => {
  const now = new Date();

  before( () => {
    global.clock = sinon.useFakeTimers( { now: (now - now % 1000) } );

  } );

  after( () => {

    global.clock.restore();

  } );

  it('create valid ics', () => {
    should(toIcs(agenda, event, 'fr'))
      .equal(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mondonville\\; L'aut côté !//agenda::fr
METHOD:PUBLISH
X-WR-CALNAME:Mondonville\\; L'aut côté !
X-WR-CALDESC:Agenda des événements de Toulouse Métropole
X-WR-RELCALID:65270117
BEGIN:VEVENT
UID:65270117//45889136//2019-12-31//20:00:00Z
DTSTART:20191231T200000Z
DTEND:20191231T220000Z
DTSTAMP:${moment(now).format('YYYYMMDDTHHmm00')}Z
TZID:Europe-Paris
SUMMARY:Réveillon de la Saint-Sylvestre
DESCRIPTION:Mondonville - Mairie de Mondonville Voir plus: https://d.openag
 enda.com/mondonville/events/reveillon-de-la-saint-sylvestre_405011
STATUS:CONFIRMED
LOCATION:Salle Orion - Chemin de Cantegril 31700 Mondonville
GEO:43.67014;1.279703
URL:https://d.openagenda.com/mondonville/events/reveillon-de-la-saint-sylve
 stre_405011
LAST-MODIFIED:20190911T042100Z
ORGANIZER:OA
END:VEVENT
END:VCALENDAR`);
  });
});
