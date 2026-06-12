import { Conflict, Forbidden } from '@openagenda/verror';
import apiErrorHandler from '../api/errorHandler.js';

// Unit-tests the api error handler's status mapping. A Conflict (e.g. the
// last-administrator guard in members.remove/patch) must surface as HTTP 409
// with its message and info, not fall through to the generic 500 — the
// frontend relies on the 409 to show the dedicated guidance.
function buildRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

describe('90 - unit: api errorHandler', () => {
  it('maps a Conflict to HTTP 409 with its message and info', () => {
    const res = buildRes();
    const err = new Conflict(
      { info: { code: 'last-administrator' } },
      'Cannot remove the last administrator of the agenda',
    );

    apiErrorHandler(err, { times: {} }, res, () => {});

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe(
      'Cannot remove the last administrator of the agenda',
    );
    expect(res.body.info).toEqual({ code: 'last-administrator' });
  });

  it('still maps a Forbidden to HTTP 403', () => {
    const res = buildRes();

    apiErrorHandler(new Forbidden('nope'), { times: {} }, res, () => {});

    expect(res.statusCode).toBe(403);
  });
});
