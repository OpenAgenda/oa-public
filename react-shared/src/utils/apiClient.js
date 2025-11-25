import ky from 'ky';
import qs from 'qs';

const stripTrailingSlash = (url = '') => url.replace(/\/+$/, '');
const stripLeadingSlash = (url = '') => url.replace(/^\/+/, '');

function getHeaderValue(req, key) {
  if (!req) return;
  if (typeof req.header === 'function') {
    return req.header(key);
  }
  return req.headers[key];
}

export default function apiClient(baseURL = null, req = null) {
  const isServer = typeof window === 'undefined';
  let token;

  const client = ky.create({
    prefixUrl: baseURL ? stripTrailingSlash(baseURL) : undefined,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    hooks: {
      beforeRequest: [
        (request, _options) => {
          if (isServer && req) {
            const cookieHeader = getHeaderValue(req, 'cookie');
            if (cookieHeader) {
              request.headers.set('cookie', cookieHeader);
            }

            const authorizationHeader = getHeaderValue(req, 'authorization');
            if (authorizationHeader) {
              request.headers.set('authorization', authorizationHeader);
            }
          }

          if (token) {
            request.headers.set('authorization', token);
          }
        },
      ],
    },
  });

  const request = (method, url, options = {}) => {
    const finalUrl = typeof url === 'string' && baseURL ? stripLeadingSlash(url) : url;

    const { searchParams, ...rest } = options;

    const finalOptions = {
      ...rest,
      method,
    };

    if (searchParams) {
      finalOptions.searchParams = typeof searchParams === 'string'
        ? searchParams
        : qs.stringify(searchParams);
    }

    return client(finalUrl, finalOptions);
  };

  const instance = (url, options = {}) => {
    const method = options.method || 'get';
    return request(method.toLowerCase(), url, options);
  };

  instance.setJwtToken = (newToken) => {
    token = newToken;
  };

  instance.get = (url, config) => request('get', url, config);
  instance.post = (url, config) => request('post', url, config);
  instance.put = (url, config) => request('put', url, config);
  instance.patch = (url, config) => request('patch', url, config);
  instance.delete = (url, config) => request('delete', url, config);
  instance.head = (url, config) => request('head', url, config);

  instance.client = client;

  return instance;
}
