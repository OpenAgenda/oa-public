import axios from 'axios';

export default function apiClient( baseURL, req ) {
  const isServer = typeof window === 'undefined';
  let token;

  const instance = axios.create( {
    baseURL,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  } );

  instance.setJwtToken = newToken => {
    token = newToken;
  };

  instance.interceptors.request.use(
    conf => {
      if ( isServer ) {
        if ( req.header( 'cookie' ) ) {
          conf.headers.Cookie = req.header( 'cookie' );
        }
        if ( req.header( 'authorization' ) ) {
          conf.headers.authorization = req.header( 'authorization' );
        }
      }

      if ( token ) {
        conf.headers.authorization = token;
      }

      return conf;
    },
    error => Promise.reject( error )
  );

  instance.interceptors.response.use(
    response => response.data,
    error => Promise.reject( error.response ? error.response.data : error )
  );

  return instance;
}
