const _ = require( 'lodash' );
const deeply = require( '../utils/deeply' );

module.exports = function snakeCaseQuery() {
  return context => _.set( context, 'params.query',
    deeply( _.mapKeys )(
      _.get( context, 'params.query', {} ),
      ( value, key ) => (_.startsWith( key, '$' ) ? key : _.snakeCase( key ))
    )
  );
}
