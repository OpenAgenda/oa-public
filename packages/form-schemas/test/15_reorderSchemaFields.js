
import should from 'should';
import reorderSchemaFields from '../client/src/lib/reorderSchemaFields';

describe( 'unit - reordering schema fields', () => {

  const schema = {
    fields: [ {
      field: 'one'
    }, {
      field: 'three'
    }, {
      field: 'four'
    }, {
      field: 'two'
    }, {
      field: 'five'
    } ]
  };

  it( 'reorders', () => {

    reorderSchemaFields( schema, 3, 1 ).fields.map( f => f.field ).should.eql( [
      'one', 'two', 'three', 'four', 'five'
    ] );

  } );

} );
