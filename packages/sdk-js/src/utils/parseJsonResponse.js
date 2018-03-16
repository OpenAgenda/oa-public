import VError from 'verror';

export default function parseJsonResponse( errorOnFail = true ) {
  return res => {
    try {
      res.body = JSON.parse( res.text );
    } catch ( err ) {
      if ( errorOnFail ) {
        throw new VError( 'Error on parsing json response', err );
      }
    }

    return res
  };
}