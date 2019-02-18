import _ from 'lodash';
import ih from 'immutability-helper';

export default ( schema, field ) => {

  const fieldIndex = _.findIndex( schema.fields, _.pick( field, 'field' ) );

  if ( fieldIndex === -1 ) {

    throw new Error( 'Did not find field to update in schema' );

  }

  let updatedField = field;

  // only labels can be changed for abstract field
  if ( schema.fields[ fieldIndex ].fieldType === 'abstract' ) {

    const update = [ 'label', 'info', 'placeholder', 'sub' ]
      .filter( label => field[ label ] )
      .reduce( ( update, label ) => _.set(
        update, label, { $set: field[ label ] }
      ), {} );

    updatedField = ih( schema.fields[ fieldIndex ], update );

  }

  return ih( schema, {
    fields: { $splice: [[ fieldIndex, 1, updatedField ]] }
  } );

}
