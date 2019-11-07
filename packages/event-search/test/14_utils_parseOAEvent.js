'use strict';

const should = require('should');

const parseOAEvent = require('../helpers/parseOAEvent');
const sourceEvent = require('./fixtures/inputEvent.json');

describe('parseOAEvent', () => {

  const parsed = parseOAEvent(sourceEvent);

  it('parsed should contain base event fields at root', () => {
    const eventFields = ['title', 'uid', 'description', 'longDescription', 'image', 'keywords'];

    eventFields.forEach(field => {
      Object.keys(parsed).includes(field).should.equal(true);
    });
  });

  it('parsed should contain details on the agenda in an agenda key', () => {
    const agendaFields = ['uid', 'slug', 'official', 'title', 'description', 'url', 'image'];

    agendaFields.forEach(field => {
      Object.keys(parsed.agenda).includes(field).should.equal(true);
    });
  });

  it('parsed should contain details on the location in a location key', () => {
    const locationFields = ['uid', 'name', 'address', 'city', 'region', 'latitude', 'longitude'];

    locationFields.forEach(field => {
      Object.keys(parsed.location).includes(field).should.equal(true);
    });
  });

  it('parsed should contain compiled public custom values in a custom key', () => {
    const publicCustomFields = ['organisateur', 'partenaire', 'referentsscientifique', 'unitesrecherche'];

    publicCustomFields.forEach(field => {
      Object.keys(parsed.custom).includes(field).should.equal(true);
    });
  });

  it('parsed should contain compiled fields accessible for administrator read in customAdministrator key', () => {
    const adminCustomFields = ['email-de-lorganisateur'];

    adminCustomFields.forEach(field => {
      Object.keys(parsed.customAdministrator).includes(field).should.equal(true);
    });
  });

  it('parsed should contain compiled fields accessible for moderator read in customModerator key', () => {
    const moderatorCustomFields = ['email-de-lorganisateur'];

    moderatorCustomFields.forEach(field => {
      Object.keys(parsed.customModerator).includes(field).should.equal(true);
    });
  });

  it('event state key contains state code and whether event is featured in agenda', () => {
    parsed.state.should.eql({
      code: 2,
      featured: false
    });
  });

});
