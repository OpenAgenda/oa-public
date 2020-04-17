import _ from 'lodash';
import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

if (module.hot) module.hot.accept();

const init = JSON.parse(document.getElementById('init').innerHTML);

(async () => {
  const initState = _.get(init, 'state');

  const config = {
    ...init.config,
    ...(await axios.get(init.config.base + '/config.json')).data
  };

  ReactDOM.render(<App {...config} />, document.getElementById('app'));

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers');
      store.replaceReducer(nextRootReducer);
    });
  }
})();
