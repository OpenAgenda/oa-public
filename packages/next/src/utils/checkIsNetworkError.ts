import { isHTTPError } from 'ky';
import { HTTPError as HTTPVError } from '@openagenda/verror';
import { NetworkError as ReactFiltersNetworkError } from '@openagenda/react-filters';

export default function checkIsNetworkError(error: Error): boolean {
  return (
    error instanceof HTTPVError ||
    isHTTPError(error) ||
    error instanceof ReactFiltersNetworkError ||
    error?.name === 'NetworkError'
  );
}
