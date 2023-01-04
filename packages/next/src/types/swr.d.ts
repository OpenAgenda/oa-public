// Import required for module completion
import 'swr';

declare module 'swr' {
  import { KeyedMutator } from 'swr';
  import { FetchStatus } from 'config/types';

  interface SWRResponse<Data = any, Error = any> {
    data?: Data;
    error?: Error;
    mutate: KeyedMutator<Data>;
    isValidating: boolean;
    // Add global fetchStatus to SWRResponse
    status: FetchStatus;
  }
}
