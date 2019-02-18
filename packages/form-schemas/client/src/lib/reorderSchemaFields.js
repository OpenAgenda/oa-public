import _ from 'lodash';
import ih from 'immutability-helper';

// this act as a swap, it should not be
export default ( schema, fromIndex, toIndex ) => ih( schema, {
  fields: {
    $splice: [
      [toIndex + ( toIndex > fromIndex ? 1 : 0 ), 0, schema.fields[ fromIndex ]],
      [fromIndex + ( toIndex < fromIndex ? 1 : 0 ), 1]
    ]
  }
} );
