import { jest } from '@jest/globals';

// Unit-tests `accessTokens/getUser` after the D5b P3 read cutover: the user is
// resolved from `access_token.user_id` only, no fallback. A null user_id is
// treated as corruption and throws.
const loadTokenMock = jest.fn();
const isTokenValidMock = jest.fn();

jest.unstable_mockModule('../services/accessTokens/lib/loadToken.js', () => ({
  default: loadTokenMock,
}));
jest.unstable_mockModule(
  '../services/accessTokens/lib/isTokenValid.js',
  () => ({ default: isTokenValidMock }),
);

const { default: getUser } = await import(
  '../services/accessTokens/lib/getUser.js'
);

// `knex(table)…` stub. Post-P3 getUser doesn't touch knex at all; the stub
// asserts that by recording every table call.
function buildKnex() {
  const calls = [];
  const knex = (table) => {
    calls.push(table);
    return { first: () => ({ where: async () => null }) };
  };
  return { knex, calls };
}

const USER = { uid: 42, id: 42 };

beforeEach(() => {
  loadTokenMock.mockReset();
  isTokenValidMock.mockReset();
  isTokenValidMock.mockResolvedValue(true);
});

describe('90 - unit - accessTokens.getUser (D5b P3 read cutover)', () => {
  it('resolves the user from token.user_id without touching knex', async () => {
    loadTokenMock.mockResolvedValue({
      id: 1,
      token: 'tk-x',
      user_id: 42,
      api_key_set_id: 999,
    });
    const { knex, calls } = buildKnex();
    const findOne = jest.fn().mockResolvedValue(USER);

    const user = await getUser(knex, { findOne }, 'tk-x');

    expect(user).toBe(USER);
    expect(calls).toEqual([]);
    expect(findOne).toHaveBeenCalledWith({
      query: { id: 42 },
      detailed: true,
    });
  });

  it('throws when token.user_id is null (no fallback)', async () => {
    loadTokenMock.mockResolvedValue({
      id: 1,
      token: 'tk-x',
      user_id: null,
      api_key_set_id: 999,
    });
    const { knex } = buildKnex();
    const findOne = jest.fn();

    await expect(getUser(knex, { findOne }, 'tk-x')).rejects.toThrow(
      'access token has no user_id',
    );
    expect(findOne).not.toHaveBeenCalled();
  });
});
