import VError from '@openagenda/verror';
import { isHTTPError } from 'ky';

/**
 * Converts a ky HTTPError into the corresponding @openagenda/verror HTTP error.
 * Returns the original error if it's not a ky HTTPError.
 */
export default async function kyErrorToVError(error: unknown): Promise<any> {
  if (!isHTTPError(error)) {
    return error as Error;
  }

  const { response } = error;
  const HttpError = VError[response.status] || VError.GeneralError;

  let body;
  try {
    body = await response.json();
  } catch {
    // ignore parse errors
  }

  return new HttpError({
    message: error.message,
    info: {
      url: response.url,
      statusText: response.statusText,
      body,
    },
  });
}
