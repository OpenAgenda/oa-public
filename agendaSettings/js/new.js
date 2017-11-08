import React from 'react';
import ReactDom from 'react-dom';
import App from 'agenda-settings/react/lib/createApp';
import deepExtend from 'deep-extend';
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

  ReactDom.hydrate( App( params ), du.el( '.js_canvas' ) );

} );
