import _ from 'lodash';

export default ( schema, extendedFrom ) => _.uniq(
    _.flatten(
      extendedFrom.map( e => e.fields )
    ).map( f => f.field )
  ).filter( field => !schema.fields.includes( field ) )
    .map( field => ( { field, fieldType: 'abstract' } ) )

}
