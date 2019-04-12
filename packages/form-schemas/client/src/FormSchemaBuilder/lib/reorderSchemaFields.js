import _ from 'lodash';
import ih from 'immutability-helper';

// this act as a swap, it should not be
export default _.assign( ( schema, fromIndex, toIndex ) => ih( schema, {
  fields: {
    $splice: [
      [toIndex + ( toIndex > fromIndex ? 1 : 0 ), 0, schema.fields[ fromIndex ]],
      [fromIndex + ( toIndex < fromIndex ? 1 : 0 ), 1]
    ]
  }
} ), {
  applyOrder
} );

function applyOrder( schema, newOrder ) {

  return ih( schema, {
    fields: {
      $set: newOrder.map( f => _.first( schema.fields.filter( field => field.field === f ) ) )
    }
  } );

}
