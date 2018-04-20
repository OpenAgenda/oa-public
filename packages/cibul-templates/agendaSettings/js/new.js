import React from 'react';
import ReactDom from 'react-dom';
import deepExtend from 'deep-extend';
import App from '@openagenda/agenda-settings/dist/react/createApp';
import du from '@openagenda/dom-utils';


const params = {
  state: {
    settings: {
      lang: 'fr',
      prefix: '/new'
    },
    res: {
      create: '/new',
      slugAvailable: '/agendas/slugs/available',
      onCreated: '/:slug/admin/settings/gettingStarted'
    }
  }
};

window.hook( options => {

  deepExtend( params, options );

  ReactDom.render( App( params ), du.el( '.js_canvas' ) );

} );
