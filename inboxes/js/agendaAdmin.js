import _ from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';
import App from '@openagenda/inbox-apps/lib/apps/agendaAdmin';
import du from '@openagenda/dom-utils';

const params = {
  state: {
    settings: {
      lang: 'fr',
      prefix: '/inboxes/agendaAdmin',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    }
  }
};

window.hook( options => {

  ReactDom.hydrate( App( _.merge( params, options ) ), du.el( '.js_canvas' ) );

} );
