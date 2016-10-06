import React from 'react';
import ReactDom from 'react-dom';
import App from 'agenda-settings/react/src/editApp';
import deepExtend from 'deep-extend';
import du from 'dom-utils';


const params = {
  settings: {
    lang: 'fr',
    prefix: '/slug/edit'
  }
};

window.hook( options => {

  deepExtend( params, options );

  ReactDom.render( App( params ), du.el( '.js_canvas' ) );

} );
