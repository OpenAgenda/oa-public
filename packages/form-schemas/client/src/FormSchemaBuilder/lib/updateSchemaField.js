import _ from 'lodash';
import ih from 'immutability-helper';

const updatableAbstractFieldKeys = [ 'label', 'info', 'placeholder', 'sub', 'display' ];

export default ( schema, field, updatedFieldValues ) => {

  const fieldIndex = _.findIndex( schema.fields, sf => sf.field === field.field );

  if ( fieldIndex === -1 ) {

    throw new Error( 'Did not find field to update in schema' );

  }

  let updatedField = field;

  // only labels, display and default value can be changed for abstract field
  if ( schema.fields[ fieldIndex ].fieldType === 'abstract' ) {

    const update = updatableAbstractFieldKeys
      .filter( fieldKey => updatedFieldValues[ fieldKey ] !== undefined )
      .reduce( ( update, fieldKey ) => _.set(
        update, fieldKey, { $set: updatedFieldValues[ fieldKey ] }
      ), {} );

    updatedField = ih( schema.fields[ fieldIndex ], update );

  } else {

    updatedField = _.assign( {}, field, updatedFieldValues );

  }

  return ih( schema, {
    fields: { $splice: [[ fieldIndex, 1, updatedField ]] }
  } );

}
