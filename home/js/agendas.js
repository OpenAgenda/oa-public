import React from 'react';
import ReactDOM from 'react-dom';
import app from 'home/react/dist/app';
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
      addEvent: '/:slug/addevent',
      search: '/agendas'
    }
  }
};

window.hook( options => {

  const params = deepExtend( {}, defaults, options );

  ReactDOM.render( app( params ), du.el( '.js_canvas' ) );

} );
