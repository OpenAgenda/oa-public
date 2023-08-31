import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import createApp from '@openagenda/inbox-apps/dist/app';
import { wrapApp } from '@openagenda/react-shared';
import du from '@openagenda/dom-utils';

const defaults = {
  initialState: {
    settings: {
      prefix: '/agenda/contact',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20,
      autoFocus: true
    }
  }
};

window.hook(options => {
  const { initialState } = _.merge({}, defaults, options);
  const extraProps = {
    user: initialState.user,
    agenda: initialState.agenda,
    ...options.extraProps
  };

  ReactDOM.render(wrapApp(
    createApp({ initialState }),
    { extraProps }
  ), du.el('.js_canvas'));
});
