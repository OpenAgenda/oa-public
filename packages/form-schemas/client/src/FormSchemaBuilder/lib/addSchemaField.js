import _ from 'lodash';
import ih from 'immutability-helper';

export default ( schema, field ) => {

  return ih( schema, { fields: { $splice: [ [ 0, 0, field ] ] } } );

}
