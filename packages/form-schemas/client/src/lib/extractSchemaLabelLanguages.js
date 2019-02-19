import _ from 'lodash';

export default schema => _.uniq( _.flatten(
  _.get( schema, 'fields', [] ).map( f => [ 'label', 'info', 'placeholder' ].reduce(
    ( fieldLanguages, label ) => _.uniq(
      fieldLanguages.concat( _.isString( f[ label ] ) ? [] : _.keys( f[ label ] ) )
    ), []
  ) )
) )
