import axios from 'axios';
import qs from 'qs';

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
        if (req.header('cookie')) {
          conf.headers.Cookie = req.header('cookie');
        }
        if (req.header('authorization')) {
          conf.headers.authorization = req.header('authorization');
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
