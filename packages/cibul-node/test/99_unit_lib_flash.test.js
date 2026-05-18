import { setFlash, FLASH_COOKIE } from '../lib/flash.js';

describe('99 - unit - lib/flash setFlash', () => {
  it('writes a one-shot cookie with the expected attributes', () => {
    const calls = [];
    const res = {
      cookie(name, value, options) {
        calls.push({ name, value, options });
      },
    };

    setFlash(res, 'Hello, world!');

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      name: FLASH_COOKIE,
      value: 'Hello, world!',
      options: { maxAge: 60_000, sameSite: 'lax', path: '/' },
    });
  });
});
