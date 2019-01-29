import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/activity-apps/dist/client/apps/user';
import du from '@openagenda/dom-utils';


const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/home',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    },
    res: {
      list: '/:uid/list'
    }
  }
};

window.hook( options => {
  const { initialState } = _.merge( {}, defaults, options );
  const { element, triggerHooks } = createApp( { initialState } );

  triggerHooks();

  ReactDOM.render( element, du.el( '.js_canvas' ) );
} );
