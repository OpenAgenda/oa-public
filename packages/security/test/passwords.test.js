import security from '..';

describe('passwords', () => {
  test('really bad password returns object with valid value set to false', () => {
    const {
      valid,
      score,
      message,
    } = security.passwords.evaluate('password');

    expect(valid).toBe(false);
    expect(score).toBe(0);
    expect(message).toEqual({
      type: 'error',
      code: 'tooWeak',
    });
  });

  test('mediocre password returns score 1 and warning but it is valid.', () => {
    const {
      valid,
      score,
      message,
    } = security.passwords.evaluate('betterpassword');

    expect(valid).toBe(true);
    expect(score).toBe(1);
    expect(message).toEqual({
      type: 'warning',
      code: 'weak',
    });
  });

  test('great password', () => {
    const {
      valid,
      score,
      message,
    } = security.passwords.evaluate('anevenbetterpasswordthatisverydifficulttoguess');

    expect(valid).toBe(true);
    expect(score).toBe(4);
    expect(message).toEqual({
      type: 'ok',
      code: 'great',
    });
  });
});
