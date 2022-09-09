import axios from 'axios';
import qs from 'qs';

function getHeaderValue(req, key) {
  if (typeof req.header === 'function') {
    return req.header(key);
  }
  return req.headers[key];
}

export default function apiClient(baseURL, req, { legacy } = {}) {
  const isServer = typeof window === 'undefined';
  let token;

  const instance = axios.create({
    baseURL,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    paramsSerializer: qs.stringify,
  });

  instance.setJwtToken = newToken => {
    token = newToken;
  };

  instance.interceptors.request.use(
    conf => {
      if (isServer) {
        if (getHeaderValue(req, 'cookie')) {
          conf.headers.Cookie = getHeaderValue(req, 'cookie');
        }
        if (getHeaderValue(req, 'authorization')) {
          conf.headers.authorization = getHeaderValue(req, 'authorization');
        }
      }

      if (token) {
        conf.headers.authorization = token;
      }

      return conf;
    },
    error => Promise.reject(error)
  );

  if (legacy) {
    instance.interceptors.response.use(
      response => response.data,
      error => Promise.reject(
        error.response && error.response.data ? error.response.data : error
      )
    );
  }

  return instance;
}
