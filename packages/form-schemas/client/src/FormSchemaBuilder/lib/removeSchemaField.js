import _ from 'lodash';
import ih from 'immutability-helper';

export default ( schema, field ) => {

  const fieldIndex = _.findIndex( schema.fields, sf => sf.field === field.field );

  return ih( schema, { fields: { $splice: [ [ fieldIndex, 1 ] ] } } );

}
