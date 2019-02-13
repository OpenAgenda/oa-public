import _ from 'lodash';
import ih from 'immutability-helper';

export default ( schema, fromIndex, toIndex ) => ih( schema, {
  fields: {
    $splice: [
      [toIndex, 1, schema.fields[ fromIndex ]],
      [fromIndex, 1, schema.fields[ toIndex]]
    ]
  }
} );
