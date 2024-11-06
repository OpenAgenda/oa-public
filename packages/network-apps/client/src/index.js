import axios from 'axios';
import { createRoot } from 'react-dom/client';
import App from './App.js';

// if (import.meta.webpackHot) import.meta.webpackHot();

const init = JSON.parse(document.getElementById('init').innerHTML);

(async () => {
  const config = {
    ...init.config,
    ...(await axios.get(`${init.config.base}/config.json`)).data,
  };

  createRoot(document.getElementById('app')).render(<App {...config} />);

  // if (import.meta.webpackHot) {
  //   import.meta.webpackHot.accept('./reducers', () => {
  //     const nextRootReducer = require('./reducers');
  //     store.replaceReducer(nextRootReducer);
  //   });
  // }
})();
