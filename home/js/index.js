import React from 'react';
// import ReactDOM from 'react-dom';
import createApp from '@openagenda/home/react/dist/app';
import deepExtend from 'deep-extend';
import du from 'dom-utils';

const defaults = {
  state: {
    settings: {
      prefix: '',
      lang: 'fr',
      apiRoot: 'http://localhost:3000'
    },
    res: {
      list: '/agendas',
      new: '/new',
      events: '/home/events',
      messages: '/home/messages',
      notifs: '/home/notifications',
      moderate: '/:slug/admin',
      show: '/:slug',
      showPrivate: '/:slug.prv',
      addEvent: '/:slug/addevent',
      search: '/agendas'
    }
  }
};

window.hook( options => {

  const params = deepExtend( {}, defaults, options );
  const app = createApp( params );

  app.match( du.el( '.js_canvas' ) );
  // ReactDOM.hydrate( app, du.el( '.js_canvas' ) );

} );
