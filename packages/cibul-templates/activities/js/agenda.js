import React from 'react';
import ReactDom from 'react-dom';
import App from '@openagenda/activity-apps/react/dist/apps/agenda';
import deepExtend from 'deep-extend';
import du from '@openagenda/dom-utils';


const params = {
  state: {
    settings: {
      lang: 'fr',
      prefix: '/activities',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    },
    res: {
      list: '/:uid/list'
    },
    agenda: {
      title: 'La gargouille',
      slug: 'la-gargouille',
      uid: 88888888
    }
  }
};

window.hook( options => {

  deepExtend( params, options );

  ReactDom.render( App( params ), du.el( '.js_canvas' ) );

} );
