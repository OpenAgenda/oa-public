'use strict';

const fs = require('fs');
const should = require('should');

const parseOAEvent = require('../parsers/OAEvent');

const emptyFormSchema = { fields: [] };
const fixture = name => JSON.parse(fs.readFileSync(`fixtures/${name}.json`));

describe('parseOAEvent', () => {

  it('parsed should contain base event fields as specified by provided schema', () => {
    const formSchema = {
      fields: [{
        field: 'title',
        schemaId: null // no schema means event field
      }, {
        field: 'description',
        schemaId: null
      }, {
        field: 'someCustomField',
        schemaId: '12.1'
      }]
    };

    const parsed = parseOAEvent(formSchema, {
      title: { fr: 'Un titre' },
      description: { fr: 'Une desc' },
      someCustomField: 'fdsqfdsq'
    });

    ['title', 'description'].forEach(eventField => {
      Object.keys(parsed).includes(eventField).should.equal(true);
    });
  });

  it('parsed should contain details on the agenda in an agenda key when provided', () => {
    const parsed = parseOAEvent(emptyFormSchema, {
      title: { fr: 'Ignored' },
      agenda: {
        uid: 129301,
        title: 'An agenda'
      }
    });

    ['uid', 'title'].forEach(agendaField => {
      parsed.agenda[agendaField].should.be.ok();
    });
  });

  it('parsed should contain details on the location in a location key when provided', () => {
    const parsed = parseOAEvent(emptyFormSchema, {
      title: { fr: 'Ignored' },
      location: {
        uid: 92001,
        name: 'Etihad accomodation',
        city: 'Masdar'
      }
    });

    ['uid', 'name', 'city'].forEach(locationField => {
      parsed.location[locationField].should.be.ok();
    });
  });

  it('parsed should contain compiled public custom values in a custom key', () => {
    const formSchema = {
      fields: [{
        field: 'someCustomField',
        schemaId: '12.1'
      }]
    };

    const parsed = parseOAEvent(formSchema, {
      someCustomField: 'Une valeur custom publique'
    });

    parsed.custom.should.eql({
      someCustomField: 'Une valeur custom publique'
    });
  });

  it('parsed should contain compiled fields accessible for administrator read in customAdministrator key', () => {
    const formSchema = {
      fields: [{
        field: 'someCustomField',
        schemaId: '12.1',
        read: ['administrator']
      }]
    };

    const parsed = parseOAEvent(formSchema, {
      someCustomField: 'Une valeur custom publique'
    });

    parsed.customAdministrator.should.eql({
      someCustomField: 'Une valeur custom publique'
    });
  });

  it('parsed should contain compiled fields accessible for moderator read in customModerator key', () => {
    const formSchema = {
      fields: [{
        field: 'someCustomField',
        schemaId: '12.1',
        read: ['moderator']
      }]
    };

    const parsed = parseOAEvent(formSchema, {
      someCustomField: 'Une valeur custom publique'
    });

    parsed.customModerator.should.eql({
      someCustomField: 'Une valeur custom publique'
    });
  });

  it('event state key contains state code and whether event is featured in agenda', () => {
    const parsed = parseOAEvent(emptyFormSchema, {
      state: 2,
      featured: true
    });

    parsed.state.should.eql({
      code: 2,
      featured: true
    });
  });

  it('when defined, contributor key contains name and uid of member user linked to event', () => {
    const parsed = parseOAEvent(emptyFormSchema, {
      member: {
        userUid: 123,
        custom: {
          contactName: 'Gaetan'
        }
      }
    });

    parsed.contributor.should.eql({
      uid: 123,
      name: 'Gaetan'
    });
  });

});
