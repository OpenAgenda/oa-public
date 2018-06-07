const errors = require( '@feathersjs/errors' );

module.exports = function searchKeyword() {
  return context => {
    if ( '$search' in context.params.query ) {
      const search = context.params.query.$search;

      if ( typeof search !== 'string' ) {
        throw new errors.BadRequest( '$search query keyword should be a string' );
      }

      delete context.params.query.$search;

      const query = context.service.createQuery( context.params );

      query
        .where( 'full_name', 'like', `%${search}%` )
        .orWhere( 'email', 'like', `%${search}%` );

      context.params.knex = query;
    }

    return context;
  };
};
