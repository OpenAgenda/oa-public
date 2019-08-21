const VError = require( 'verror' );
const errors = require( '@feathersjs/errors' );
const { checkContext } = require( 'feathers-hooks-common' );
const setInStore = require( './setInStore' );

module.exports = function softDelete( field, additionalParams = {} ) {
  const deleteField = field || 'deleted';

  return context => {
    const service = context.service;
    context.data = context.data || {};
    context.params.query = context.params.query || {};
    checkContext( context, 'before', null, 'softDelete' );

    if ( context.params.query.$disableSoftDelete ) {
      delete context.params.query.$disableSoftDelete;
      return context;
    }

    switch ( context.method ) {
      case 'find':
        context.params.query[ deleteField ] = 0;
        return context;
      case 'get':
        return throwIfItemDeleted( context.id, true )
          .then( data => {
            context.result = data;
            return context;
          } );
      case 'create':
        return context;
      case 'update': // fall through
      case 'patch':
        if ( context.id !== null ) {
          return throwIfItemDeleted( context.id )
            .then( () => context );
        }
        context.params.query[ deleteField ] = 0;
        return context;
      case 'remove':
        return Promise.resolve()
          .then( () => context.id ? throwIfItemDeleted( context.id ) : null )
          .then( async () => {
            const date = new Date();
            const before = context.params.before;

            context.data[ deleteField ] = 1;
            context.data.isActivated = 0;
            context.data.username = `*removed-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${before.id}`;
            context.data.email = null;

            await setInStore( 'email', 'params.before.email' )( context );

            context.params.query[ deleteField ] = 0;
            context.params.query.$disableSoftDelete = true;
            context.params.internal = true;

            return service.patch( context.id, context.data, context.params )
              .then( result => {
                context.result = result;
                return context;
              } );
          } );
    }

    function throwIfItemDeleted( id, isGet ) {
      const params = isGet ? context.params : {
        query: {},
        provider: context.params.provider,
        _populate: 'skip',
        authenticated: context.params.authenticated,
        user: context.params.user
      };

      params.query.$disableSoftDelete = true;
      params.query.$disableStashBefore = true;

      return service.get( id, Object.assign( {}, params, additionalParams ) )
        .then( data => {
          delete params.query.$disableSoftDelete;

          if ( !data || data[ deleteField ] ) {
            throw new errors.NotFound( 'Item has been soft deleted' );
          }

          return data;
        } )
        .catch( e => {
          throw new errors.NotFound( new VError( e, 'No record found' ) );
        } );
    }
  };
};
