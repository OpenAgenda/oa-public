import _ from 'lodash';
import ih from 'immutability-helper';

export default ( schema, updatedMerge ) => {

  return ih( schema, { fields: {
    $set: updatedMerge.fields.map( f => {

      const fieldIndex = _.findIndex( schema.fields, sf => sf.field === f.field );

      if ( fieldIndex === -1 ) return {
        field: f.field,
        fieldType: 'abstract'
      }

      return schema.fields[ fieldIndex ];

    } )
  } } );

}
