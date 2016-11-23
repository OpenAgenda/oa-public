import React from 'react';
import ReactDom from 'react-dom';
import App from 'aggregator-sources/react/dist/app';
import deepExtend from 'deep-extend';
import du from 'dom-utils';


const params = {
  state: {
    settings: {
      lang: 'fr',
      prefix: '/aggregatorSources',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    },
    res: {
      list: '/sources.json',
      show: '#',
      delete: '#',
      search: '#'
    },
    agenda: {
      title: 'La gargouille',
      slug: 'la-gargouille',
    }
  }
};

window.hook( options => {

  deepExtend( params, options );

  ReactDom.render( App( params ), du.el( '.js_canvas' ) );

} );
