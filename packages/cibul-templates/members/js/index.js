import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import du from '@openagenda/dom-utils';
import createApp from "@openagenda/member-apps/dist/app";


const defaults = {
  state: {
    settings: {
      lang: 'fr',
      prefix: '/members',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    },
    res: {
      list: '/sources.json',
      stats: '#'
    },
    agenda: {
      title: 'La gargouille',
      slug: 'la-gargouille'
    }
  }
};

window.hook( options => {
  const { initialState } = _.merge( {}, defaults, options );
  const { element, triggerHooks } = createApp( { initialState } );

  triggerHooks();

  ReactDOM.render( element, du.el( '.js_canvas' ) );
} );
