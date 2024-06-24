import { BadRequest } from '@openagenda/verror';

export default function handleError(message, e) {
  if (e.response?.status === 400) {
    return new BadRequest(message, { info: e.response.data });
  }
  return e;
}
