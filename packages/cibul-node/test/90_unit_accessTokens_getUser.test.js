import { jest } from '@jest/globals';

// Unit-tests the D5b P2 dual-read path on `accessTokens/getUser`. Asserts that
// a token carrying the new `user_id` column resolves the user directly (no
// `api_key_set` join), while a legacy token without `user_id` still falls back
// on the join — the rollback-safety filet that goes away at P3.
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

// `knex(table).first(col).where(...)` builder stub. Only the api_key_set
// lookup hits this; we count calls to know if the dual-read kicked in.
function buildKnex({ apiKeySet }) {
  const calls = [];
  const knex = (table) => {
    calls.push(table);
    return {
      first: () => ({
        where: async () => apiKeySet,
      }),
    };
  };
  return { knex, calls };
}

const USER = { uid: 42, id: 42 };

beforeEach(() => {
  loadTokenMock.mockReset();
  isTokenValidMock.mockReset();
  isTokenValidMock.mockResolvedValue(true);
});

describe('90 - unit - accessTokens.getUser (D5b dual-read)', () => {
  it('uses token.user_id directly and skips the api_key_set join', async () => {
    loadTokenMock.mockResolvedValue({
      id: 1,
      token: 'tk-x',
      user_id: 42,
      api_key_set_id: 999,
    });
    const { knex, calls } = buildKnex({ apiKeySet: null });
    const findOne = jest.fn().mockResolvedValue(USER);

    const user = await getUser(knex, { findOne }, 'tk-x');

    expect(user).toBe(USER);
    expect(calls).toEqual([]); // no api_key_set lookup
    expect(findOne).toHaveBeenCalledWith({
      query: { id: 42 },
      detailed: true,
    });
  });

  it('falls back on the api_key_set join when user_id is null (legacy row)', async () => {
    loadTokenMock.mockResolvedValue({
      id: 1,
      token: 'tk-x',
      user_id: null,
      api_key_set_id: 999,
    });
    const { knex, calls } = buildKnex({ apiKeySet: { user_id: 42 } });
    const findOne = jest.fn().mockResolvedValue(USER);

    const user = await getUser(knex, { findOne }, 'tk-x');

    expect(user).toBe(USER);
    expect(calls).toEqual(['api_key_set']);
    expect(findOne).toHaveBeenCalledWith({
      query: { id: 42 },
      detailed: true,
    });
  });

  it('throws when both the legacy fallback and user_id are missing', async () => {
    loadTokenMock.mockResolvedValue({
      id: 1,
      token: 'tk-x',
      user_id: null,
      api_key_set_id: 999,
    });
    const { knex } = buildKnex({ apiKeySet: null });
    const findOne = jest.fn();

    await expect(getUser(knex, { findOne }, 'tk-x')).rejects.toThrow(
      'could not find api key set matching token',
    );
    expect(findOne).not.toHaveBeenCalled();
  });
});
