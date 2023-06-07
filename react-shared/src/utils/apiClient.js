import axios from 'axios';
import qs from 'qs';

function getHeaderValue(req, key) {
  if (!req) return;
  if (typeof req.header === 'function') {
    return req.header(key);
  }
  return req.headers[key];
}

export default function apiClient(baseURL = null, req = null, { legacy } = {}) {
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
        const cookieHeader = getHeaderValue(req, 'cookie');
        if (cookieHeader) {
          conf.headers.Cookie = cookieHeader;
        }

        const authorizationHeader = getHeaderValue(req, 'authorization');
        if (authorizationHeader) {
          conf.headers.authorization = authorizationHeader;
        }
      }

      if (token) {
        conf.headers.authorization = token;
      }

      return conf;
    },
    error => Promise.reject(error),
  );

  if (legacy) {
    instance.interceptors.response.use(
      response => response.data,
      error => Promise.reject(
        error.response && error.response.data ? error.response.data : error,
      ),
    );
  }

  return instance;
}
