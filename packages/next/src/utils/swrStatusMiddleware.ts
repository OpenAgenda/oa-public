import { Middleware } from 'swr';
import { FetchStatus } from 'config/types';

const swrStatusMiddleware: Middleware = useSWRNext => (key, fetcher, config) => {
  const swr = useSWRNext(key, fetcher, config);
  return Object.defineProperty(swr, 'status', {
    get() {
      let status = FetchStatus.Idle;
      const isDataUndefined = typeof swr.data === 'undefined';

      if (!swr.isValidating && !swr.error && isDataUndefined) {
        status = FetchStatus.Idle;
      } else if (swr.isValidating && !swr.error && isDataUndefined) {
        status = FetchStatus.Fetching;
      } else if (!isDataUndefined) {
        status = FetchStatus.Fetched;
      } else if (swr.error && isDataUndefined) {
        status = FetchStatus.Failed;
      }
      return status;
    },
    enumerable: true,
  });
};

export default swrStatusMiddleware;
