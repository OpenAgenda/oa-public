import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';

const log = logs('handleError');

export default function handleError(message, e) {
  log.error(message, e);
  if (e.response?.status === 400) {
    return new BadRequest({ info: e.response.data }, message);
  }
  return e;
}
