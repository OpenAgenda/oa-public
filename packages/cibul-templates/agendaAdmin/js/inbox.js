import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/inbox-apps/dist/apps/inbox';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import du from '@openagenda/dom-utils';

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/inboxes/agendaAdmin',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20,
      autoFocus: true
    }
  }
};

window.hook( options => {
  const { initialState } = _.merge( {}, defaults, options );

  ReactDOM.render( wrapApp( createApp( { initialState } ) ), du.el( '.js_canvas' ) );
} );
