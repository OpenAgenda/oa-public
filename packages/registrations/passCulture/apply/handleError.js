import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';

const log = logs('handleError');

export default async function handleError(message, e) {
  log.error(message, e);
  if (e.response?.status === 400) {
    return new BadRequest({ info: await e.response.json() }, message);
  }
  return e;
}
