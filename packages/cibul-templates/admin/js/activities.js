import React from 'react';
import ReactDom from 'react-dom';
import App from '@openagenda/activity-apps/dist/react/apps/admin';
import deepExtend from 'deep-extend';
import du from '@openagenda/dom-utils';


const params = {
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

  deepExtend( params, options );

  ReactDom.render( App( params ), du.el( '.js_canvas' ) );

} );
