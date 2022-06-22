'use strict';

const reorderSchemaFields = require('../client/src/FormSchemaBuilder/lib/reorderSchemaFields');

describe('unit - reordering schema fields', () => {
  const schema = {
    fields: [{
      field: 'one'
    }, {
      field: 'three'
    }, {
      field: 'four'
    }, {
      field: 'two'
    }, {
      field: 'five'
    }]
  };

  it('reorders', () => {
    expect(reorderSchemaFields(schema, 3, 1).fields.map(f => f.field)).toStrictEqual([
      'one', 'two', 'three', 'four', 'five'
    ]);
  });
});
