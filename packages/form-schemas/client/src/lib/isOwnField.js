import _ from 'lodash';

export default ( schema, field ) => {

  const matching = _.find( _.get( schema, 'fields', [] ), { field: field.field } );

  return _.get( matching, 'fieldType', 'abstract' ) !== 'abstract';

}
