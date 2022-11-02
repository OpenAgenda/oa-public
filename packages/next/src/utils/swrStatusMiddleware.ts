import { Middleware } from 'swr';
import { FetchStatus } from 'config/types';

const swrStatusMiddleware: Middleware = useSWRNext => (key, fetcher, config) => {
  const swr = useSWRNext(key, fetcher, config);
  return Object.defineProperty(swr, 'status', {
    enumerable: true,
    get() {
      let status = FetchStatus.Idle;

      if (!swr.isValidating && !swr.error && !swr.data) {
        status = FetchStatus.Idle;
      } else if (swr.isValidating && !swr.error && !swr.data) {
        status = FetchStatus.Fetching;
      } else if (swr.data) {
        status = FetchStatus.Fetched;
      } else if (swr.error && !swr.data) {
        status = FetchStatus.Failed;
      }
      return status;
    },
  });
};

export default swrStatusMiddleware;
