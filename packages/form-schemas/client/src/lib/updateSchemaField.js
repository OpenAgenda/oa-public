import _ from 'lodash';
import ih from 'immutability-helper';

const updatableAbstractFieldKeys = [ 'label', 'info', 'placeholder', 'sub', 'display' ];

export default ( schema, field ) => {

  const fieldIndex = _.findIndex( schema.fields, sf => sf.field === field.field );

  if ( fieldIndex === -1 ) {

    throw new Error( 'Did not find field to update in schema' );

  }

  let updatedField = field;

  // only labels can be changed for abstract field
  if ( schema.fields[ fieldIndex ].fieldType === 'abstract' ) {

    const update = updatableAbstractFieldKeys
      .filter( fieldKey => field[ fieldKey ] !== undefined )
      .reduce( ( update, fieldKey ) => _.set(
        update, fieldKey, { $set: field[ fieldKey ] }
      ), {} );

    updatedField = ih( schema.fields[ fieldIndex ], update );

  }

  return ih( schema, {
    fields: { $splice: [[ fieldIndex, 1, updatedField ]] }
  } );

}
