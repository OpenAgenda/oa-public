'use strict';

const dispacthDataPerSchemas = require('../iso/dispatchDataPerSchemas');

describe('dispacthDataPerSchemas', () => {
  beforeAll(() => {
  });
  it('basic dispatch', () => {
    const data = {
      name: 'Jack',
      email: 'test@mail.com',
      description: 'blablabla'
    };
    const schemas = [
      {
        id: 1,
        fields: [{
          field: 'description',
          fieldType: 'text',
          label: 'Description'
        },
        {
          field: 'name',
          fieldType: 'abstract',
          label: 'Name'
        }]
      },
      {
        id: 2,
        fields: [{
          field: 'name',
          fieldType: 'text',
          label: 'Name'
        }, {
          field: 'email',
          fieldType: 'email',
          label: 'Email'
        }]
      }
    ];
    const res = dispacthDataPerSchemas(data, schemas);
    expect(res).toStrictEqual([
      { description: 'blablabla' },
      { name: 'Jack', email: 'test@mail.com' }
    ]);
  });
});
