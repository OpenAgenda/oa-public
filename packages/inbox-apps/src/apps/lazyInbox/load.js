import _ from 'lodash';
import loadScript from 'load-script';

export default function loadApp( options ) {

  const params = _.merge( {
    functionName: '',
    selector: '.js_inbox_event',
    jsFilePath: '/js/inboxEvent.js',
    state: {
      settings: {
        prefix: '/',
        lang: 'fr',
        perPageLimit: 20
      },
      res: {}
    }
  }, options );

  loadScript( params.jsFilePath, err => {

    if ( err ) {
      return console.log( 'Error on script load:', err );
    }

    if ( window[ params.functionName ] ) {
      window[ params.functionName ]( params );
    }

  } );

}
