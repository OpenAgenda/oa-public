import _ from 'lodash';
import loadScript from 'load-script';
import ReactDOM from 'react-dom';
import du from '@openagenda/dom-utils';

export default function loadApp( options, cb ) {

  const params = _.merge( {
    functionName: '',
    selector: '.js_inbox_event',
    jsFilePath: '/js/inboxEvent.js',
    initialState: {
      settings: {
        prefix: '',
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
      const { element } = window[ params.functionName ]( params );

      ReactDOM.render( element, du.el( params.selector ) );
    }

    if ( cb ) {
      cb();
    }

  } );

}
