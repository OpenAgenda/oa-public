import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/activity-apps/dist/client/apps/admin';
import du from '@openagenda/dom-utils';


const defaults = {
  state: {
    settings: {
      lang: 'fr',
      prefix: '/admin/activities',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    },
    res: {
      list: '/list'
    }
  }
};

window.hook( options => {
  const { initialState } = _.merge( {}, defaults, options );
  const { element, triggerHooks } = createApp( { initialState } );

  triggerHooks();

  ReactDOM.render( element, du.el( '.js_canvas' ) );
} );
