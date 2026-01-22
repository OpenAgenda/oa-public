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

function extractAndMergeParams(url, searchParams) {
  let existingParams = {};
  let cleanUrl = url;

  if (url instanceof URL) {
    existingParams = qs.parse(url.search.slice(1));
    cleanUrl = new URL(url.origin + url.pathname);
  } else if (typeof url === 'string' && url.includes('?')) {
    const [base, query] = url.split('?');
    existingParams = qs.parse(query);
    cleanUrl = base;
  }

  if (!searchParams) return { url: cleanUrl, params: existingParams };

  const newParams = typeof searchParams === 'string' ? qs.parse(searchParams) : searchParams;
  return {
    url: cleanUrl,
    params: { ...existingParams, ...newParams },
  };
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

    const { url: cleanUrl, params } = extractAndMergeParams(
      finalUrl,
      searchParams,
    );

    const finalOptions = {
      ...rest,
      method,
      ...Object.keys(params).length > 0 && {
        searchParams: qs.stringify(params),
      },
    };

    return client(cleanUrl, finalOptions);
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
