const _ = require( 'lodash' );
const superagent = require( 'superagent' );

const methods = [ 'get', 'post', 'put', 'patch', 'del' ];

const defaultOptions = {
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
}

class ApiClient {
  constructor( apiRoot, req ) {
    this.apiRoot = apiRoot;

    this.formatUrl = path => {
      const adjustedPath = path[ 0 ] !== '/' ? `/${path}` : path;
      if ( typeof window === 'undefined' ) {
        // Prepend host and port of the API server to the path.
        return this.apiRoot + adjustedPath;
      }
      return adjustedPath;
    }

    methods.forEach( method => {
      this[ method ] = ( path, options ) => new Promise( ( resolve, reject ) => {
        const { query, data, headers, files, fields } = _.merge( {}, defaultOptions, options );

        const request = superagent[ method ]( this.formatUrl( path ) );

        if ( query ) {
          request.query( query );
        }

        if ( typeof window === 'undefined' && req ) {
          if ( req.get( 'cookie' ) ) {
            request.set( 'cookie', req.get( 'cookie' ) );
          }

          if ( req.get( 'x-forwarded-for' ) ) {
            request.set( 'x-forwarded-for', req.get( 'x-forwarded-for' ) );
          }
        }

        if ( headers ) {
          request.set( headers );
        }

        if ( files ) {
          files.forEach( file => request.attach( file.key, file.value ) );
        }

        if ( fields ) {
          fields.forEach( item => request.field( item.key, item.value ) );
        }

        if ( data ) {
          request.send( data );
        }

        request.end( ( err, { body } = {} ) => (err ? reject( body || err ) : resolve( body )) );
      } );
    } );
  }
}

module.exports = ApiClient;
