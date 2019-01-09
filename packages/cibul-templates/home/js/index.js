import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/home/dist/client/app';
import deepExtend from 'deep-extend';
import du from '@openagenda/dom-utils';

const defaults = {
  initialState: {
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
  const { initialState } = deepExtend( {}, defaults, options );
  const { element, triggerHooks } = createApp( { initialState } );

  triggerHooks();

  ReactDOM.render( element, du.el( '.js_canvas' ) );
} );
