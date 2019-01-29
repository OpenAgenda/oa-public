import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/user-apps/dist/app';
import du from '@openagenda/dom-utils';

const defaults = {
  initialState: {
    settings: {
      prefix: '',
      lang: 'fr',
      apiRoot: 'http://localhost:3000'
    }
  }
};


window.hook( options => {
  const { initialState } = _.merge( {}, defaults, options );
  const { element, triggerHooks } = createApp( { initialState } );

  triggerHooks();

  ReactDOM.render( element, du.el( '.js_canvas' ) );
} );
