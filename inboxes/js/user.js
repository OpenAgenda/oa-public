import _ from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';
import App from '@openagenda/inbox-apps/lib/apps/inbox';
import du from '@openagenda/dom-utils';

const params = {
  state: {
    settings: {
      lang: 'fr',
      prefix: '/inboxes/user',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    }
  }
};

window.hook( options => {

  ReactDom.render( App( _.merge( params, options ) ), du.el( '.js_canvas' ) );

} );
