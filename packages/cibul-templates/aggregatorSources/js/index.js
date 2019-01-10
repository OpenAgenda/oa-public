import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/aggregator-sources/dist/client/app';
import deepExtend from 'deep-extend';
import du from '@openagenda/dom-utils';


const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/aggregatorSources',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    },
    res: {
      list: '/sources.json',
      show: '#',
      remove: '#',
      search: '#'
    },
    agenda: {
      title: 'La gargouille',
      slug: 'la-gargouille',
    }
  }
};

window.hook( options => {
  const { initialState } = deepExtend( {}, defaults, options );
  const { element, triggerHooks } = createApp( { initialState } );

  triggerHooks();

  ReactDOM.render( element, du.el( '.js_canvas' ) );
} );
