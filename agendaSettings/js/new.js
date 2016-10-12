import React from 'react';
import ReactDom from 'react-dom';
import App from 'agenda-settings/react/src/createApp';
import deepExtend from 'deep-extend';
import du from 'dom-utils';


const params = {
  state: {
    settings: {
      lang: 'fr',
      prefix: '/new'
    },
    res: {
      create: '/new',
      slugAvailable: '/agendas/slugs/available',
      onCreated: '/:slug/admin?bravo'
    }
  }
};

window.hook( options => {

  deepExtend( params, options );

  ReactDom.render( App( params ), du.el( '.js_canvas' ) );

} );
