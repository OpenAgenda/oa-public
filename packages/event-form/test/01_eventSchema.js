'use strict';

const _ = require('lodash');
const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');

const eventSchema = require('../src/schema');

describe('event-form eventSchema', () => {
  test('languages set to true equates no languages', () => {
    const es = eventSchema({
      languages: true,
    });

    expect(
      es.fields.filter(f => f.field === 'description')[0].languages,
    ).toEqual([]);
  });

  test('null languages are filtered out', () => {
    const es = eventSchema({
      languages: [null],
      schemaExtensions: [{
        fields: [{
          field: 'description',
          fieldType: 'abstract',
          default: {
            fr: 'Une desc',
            en: 'A desc',
          },
        }],
      }],
    });

    expect(
      es.fields.filter(f => f.field === 'description')[0].languages,
    ).toEqual([]);
  });

  test('event schema fields can be excluded altogether', () => {
    const es = eventSchema({
      includeEventFields: false,
      schemaExtensions: [{
        fields: [{
          field: 'title',
          fieldType: 'abstract',
          label: 'Nom de l\'événement',
        }, {
          field: 'exhibitors',
          fieldType: 'integer',
          label: 'Exposants',
        }],
      }],
    });

    expect(es.fields.map(f => f.field)).toEqual([
      'exhibitors',
    ]);
  });

  test('event schema generator requires languages to be specified for multilingual fields', () => {
    const es = eventSchema({
      languages: ['fr', 'en'],
    });

    const multilingualFields = es.fields
      .filter(f => f.languages)
      .map(f => _.pick(f, ['languages', 'field']));

    expect(multilingualFields).toEqual([{
      languages: ['fr', 'en'],
      field: 'title',
    }, {
      languages: ['fr', 'en'],
      field: 'description',
    }, {
      languages: ['fr', 'en'],
      field: 'keywords',
    }, {
      languages: ['fr', 'en'],
      field: 'longDescription',
    }, {
      languages: ['fr', 'en'],
      field: 'conditions',
    }]);
  });

  test('languages form field is part of schema if "excludeNonDataFields" option is false (default)', () => {
    const es = eventSchema({
      excludeNonDataFields: false,
    });

    expect(es.fields.filter(f => f.field === 'languages').length).toEqual(1);
  });

  test('languages form field is excluded if "excludeNonDataFields" option is true', () => {
    const es = eventSchema({
      excludeNonDataFields: true,
    });

    expect(es.fields.filter(f => f.field === 'languages').length).toEqual(0);
  });

  test('internal event fields are part of schema if access is read "internal"', () => {
    const privateFields = ['id', 'uid', 'slug', 'draft', 'private', 'createdAt', 'updatedAt', 'timezone', 'agendaUid', 'locationUid'];

    const es = eventSchema({
      access: {
        read: 'internal',
      },
    });

    expect(es.fields.filter(f => privateFields.includes(f.field)).length).toEqual(privateFields.length);
  });

  test('location can be explicitely set to null', () => {
    const es = eventSchema({
      languages: [],
    });

    const validate = new FormSchema(es).getValidate();

    const clean = validate.part({
      attendanceMode: 2,
      onlineAccessLink: 'https://openagenda.com',
      location: null,
    });

    expect(clean.location).toBeNull();
  });
});
