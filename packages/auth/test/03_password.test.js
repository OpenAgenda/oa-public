import { encodeLegacy, parseLegacy } from '../src/password.js';

describe('auth - unit: password format', () => {
  it('encodes sha256 in sentinel format', () => {
    expect(encodeLegacy('sha256', 'abc12345', 'deadbeef')).toBe(
      'legacy-sha256$abc12345$deadbeef',
    );
  });

  it('encodes sha1 in sentinel format', () => {
    expect(encodeLegacy('sha1', 'salty', '01abcd')).toBe(
      'legacy-sha1$salty$01abcd',
    );
  });

  it('rejects unsupported algos', () => {
    expect(() => encodeLegacy('md5', 's', 'h')).toThrow(/unsupported algo/);
  });

  it('parses sha256 sentinel format', () => {
    expect(parseLegacy('legacy-sha256$abc12345$deadbeef')).toEqual({
      algo: 'sha256',
      salt: 'abc12345',
      hex: 'deadbeef',
    });
  });

  it('parses sha1 sentinel format', () => {
    expect(parseLegacy('legacy-sha1$salty$01abcd')).toEqual({
      algo: 'sha1',
      salt: 'salty',
      hex: '01abcd',
    });
  });

  it('returns null for non-legacy strings', () => {
    expect(parseLegacy('$argon2id$v=19$m=65536,t=2,p=1$abc$def')).toBeNull();
    expect(parseLegacy('plaintext')).toBeNull();
    expect(parseLegacy('')).toBeNull();
    expect(parseLegacy(null)).toBeNull();
  });
});
