'use strict';

const should = require('should');
const fs = require('fs');
const config = require('../testconfig');
const Service = require('../');

describe('04 - event search - functional: add', function() {
  let service;

  this.timeout( 20000 );

  const eventData = {
    id: 679689,
    uid: 74367684,
    title: {
      fr: 'un nouvel événement',
      en: 'a new event'
    },
    description: {
      fr: 'Une desc courte',
      en: 'A short description'
    },
    location: {
      name : 'La boutique',
      address : '29 passage du Ponceau, Paris"',
      latitude : 48.8675959,
      longitude : 2.3516408,
      district : 'Paris 02',
      city : 'Paris',
      department : 'Paris',
      region : 'Ile-de-France',
      countryCode : 'FR',
      timezone : 'Europe/Paris'
    },
    timings: [{
      begin: new Date( '2027-04-20T12:00:00+0100' ),
      end: new Date( '2027-04-20T13:00:00+0100' )
    }],
    timezone: 'Europe/Paris',
    state: {
      code: 2
    }
  }

  before( async () => {
    service = Service(config);
    await service('test_index').rebuild({
      eventsList: async function(lastId, limit ) {
        return JSON.parse(fs.readFileSync(`${__dirname}/fixtures/04_events.${lastId}.${limit}.json`));
      }
    });
  } );


  it('add an event to an index', async () => {
    const result = await service('test_index').add(eventData, { refresh: true });

    result.success.should.equal(true);

    await _timeout(1000);

    let { events, total } = await service('test_index').search({ uid: 74367684 });

    total.should.equal(1);

    events[0].uid.should.equal(74367684);
  });


  it('add an event to an index that does not exist', async () => {
    const result = await service('blargh3').add(eventData, { refresh: true });

    result.should.eql({
      success: false,
      status: 404,
      message: 'index not found'
    });
  });


  it('add nothing throws an error', async () => {
    try {
      await service('test_index').add();
    } catch (e) {
      e.message.should.equal('data is unavailable for indexing');
    }
  });
});

async function _timeout( ms ) {

  return new Promise( rs => {

    setTimeout( rs, ms );

  } );

}

function _getYesterdayDate( secondsOffset ) {

  const yesterday = new Date();

  yesterday.setDate( ( new Date() ).getDate() - 1 );

  yesterday.setSeconds( yesterday.getSeconds() + secondsOffset );

  return yesterday;

}
