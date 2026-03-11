import { setupService } from './setup.js';

const { getService } = setupService();

describe('find', () => {
  it('find with a search query', async () => {
    const { total, data: users } = await getService().find({
      query: {
        $search: 'latouche',
      },
    });

    expect(total).toBe(1);
    expect(users[0]).toMatchObject({
      fullName: 'Gaetan Latouche',
    });
  });

  it('does not find anything', async () => {
    const { total, data: users } = await getService().find({
      query: {
        $search: 'fdsqfdsqfdsqfdsq',
      },
    });

    expect(total).toBe(0);
    expect(users).toEqual([]);
  });

  it('find with uid query', async () => {
    const { total, data: users } = await getService().find({
      query: {
        uid: {
          $in: [54505079, 27639980],
        },
      },
    });

    expect(total).toBe(2);
    expect(users.map((v) => v.uid)).toEqual(
      expect.arrayContaining([27639980, 54505079]),
    );
  });

  it('find with detailed param', async () => {
    const { data: users } = await getService().find({
      query: {
        $search: 'latouche',
      },
      detailed: true,
    });

    expect(users[0]).toHaveProperty('isRemoved');
    expect(users[0]).toHaveProperty('isActivated');
  });

  it('find with removed param at true', async () => {
    const { total, data: users } = await getService().find({
      removed: true,
      detailed: true,
    });

    expect(total).toBe(1);
    expect(users[0]).toMatchObject({
      isRemoved: true,
    });
  });

  it('find with removed param at false', async () => {
    const { total, data: users } = await getService().find({
      removed: false,
      detailed: true,
    });

    expect(total).toBe(26);
    expect(users[0]).toMatchObject({
      isRemoved: false,
    });
  });

  it('find with removed param at null', async () => {
    const { total } = await getService().find({
      removed: null,
      detailed: true,
    });

    expect(total).toBe(27);
  });
});
