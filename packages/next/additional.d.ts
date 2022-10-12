import { KeyedMutator } from 'swr';
import { FetchStatus } from 'config/types';

declare module 'http' {
  interface IncomingMessage {
    user?: null | object;
  }
}

declare module 'swr' {
  // eslint-disable-next-line no-unused-vars
  interface SWRResponse<Data = any, Error = any> {
    data?: Data;
    error?: Error;
    mutate: KeyedMutator<Data>;
    isValidating: boolean;
    // Add global fetchStatus to SWRResponse
    status: FetchStatus;
  }
}
