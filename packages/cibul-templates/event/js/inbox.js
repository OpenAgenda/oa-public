import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/inbox-apps/dist/apps/inbox';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import du from '@openagenda/dom-utils';
import * as RHL from 'react-hot-loader';

if (!module.hot) {
  RHL.AppContainer.warnAboutHMRDisabled = false;
  RHL.hot.shouldWrapWithAppContainer = false;
}

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    }
  }
};

window.hook( options => {
  const { initialState } = _.merge( {}, defaults, options );
  const extraProps = {
    user: initialState.user,
    agenda: initialState.agenda,
    ...options.extraProps
  };

  ReactDOM.render( wrapApp( createApp( { initialState } ), { extraProps } ), du.el( '.js_canvas' ) );
} );
