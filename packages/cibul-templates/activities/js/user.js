import React from 'react';
import ReactDom from 'react-dom';
import deepExtend from 'deep-extend';
import App from '@openagenda/activity-apps/react/dist/apps/user';
import du from '@openagenda/dom-utils';


const params = {
  state: {
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

  deepExtend( params, options );

  ReactDom.render( App( params ), du.el( '.js_canvas' ) );

} );
