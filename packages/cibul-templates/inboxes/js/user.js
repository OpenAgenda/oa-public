import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/inbox-apps/dist/apps/inbox';
import du from '@openagenda/dom-utils';

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/inboxes/user',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    }
  }
};

window.hook( options => {
  const { initialState } = _.merge( {}, defaults, options );
  const { element } = createApp( { initialState } );

  ReactDOM.render( element, du.el( '.js_canvas' ) );
} );
