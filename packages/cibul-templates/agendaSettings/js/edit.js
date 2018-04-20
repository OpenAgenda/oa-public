import React from 'react';
import ReactDom from 'react-dom';
import deepExtend from 'deep-extend';
import App from '@openagenda/agenda-settings/dist/react/editApp';
import du from '@openagenda/dom-utils';


const params = {
  state: {
    settings: {
      lang: 'fr',
      prefix: '/agendaSettings/edit',
      apiRoot: `localhost:${process.env.PORT || 3000}`
    },
    res: {
      get: '/agendas/:uid/admin/settings.json',
      slugAvailable: '/agendas/slugs/available',
      set: '/:slug/admin/settings/edit',
      uploadImage: '/:slug/admin/settings/setImage',
      clearImage: '/:slug/admin/settings/clearImage',
      remove: '/:slug/admin/settings/remove'
    },
    agenda: {
      uid: '17026855'
    }
  }
};

window.hook( options => {

  deepExtend( params, options );

  ReactDom.render( App( params ), du.el( '.js_canvas' ) );

} );
