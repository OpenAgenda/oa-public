import Service from '../index.js';
import config from '../testconfig.js';

describe('02 - event search - functional: synthaxic', () => {
  let service;

  beforeAll(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) {
      // console.log(e);
    }
  });

  beforeAll(async () => {
    await service('synthaxic').rebuild({
      eventsList: async (_lastId, _limit) =>
        (await import('./fixtures/02_events.synthaxic.json', { type: 'json' }))
          .default,
    });
  });

  it('Expo shows Exposition too', async () => {
    const { events } = await service('synthaxic').search(
      {
        search: 'Expo',
      },
      {},
      { detailed: true },
    );

    expect(
      events.filter((e) => e.title.fr.indexOf('exposition') !== -1).length,
    ).toBe(1);
  });

  it('Frank show Frankenstein', async () => {
    const { events } = await service('synthaxic').search({
      search: 'Frank',
    });

    expect(events.length).toBe(1);
    expect(events[0].title.fr).toBe('Frankenstein');
  });

  it('Non-accented search returns results with accents', async () => {
    const { events } = await service('synthaxic').search({
      search: 'Theatre',
    });

    expect(events.length).toBe(1);
    expect(events[0].title.fr).toBe('Théâtre');
  });

  it('Differently cased search matches with cased variants', async () => {
    const { events } = await service('synthaxic').search({
      search: 'theatre',
    });

    expect(events.length).toBe(1);
    expect(events[0].title.fr).toBe('Théâtre');
  });

  it('"Broyage" should not match with "Royal"', async () => {
    const { events } = await service('synthaxic').search({
      search: 'Broyage',
    });

    expect(events.length).toBe(0);
  });

  it('"marche" matches with "Marché", "Marche", "marche" and "marché"', async () => {
    const { events } = await service('synthaxic').search({
      search: 'marché',
    });

    expect(events.length).toBe(4);
  });

  it('varying term order should not prevent matches', async () => {
    expect(
      await service('synthaxic')
        .search({
          search: 'Zeus',
        })
        .then(({ total }) => total),
    ).toBe(2);

    expect(
      await service('synthaxic')
        .search({
          search: 'zeus cheval',
        })
        .then(({ total }) => total),
    ).toBe(2);

    expect(
      await service('synthaxic')
        .search({
          search: 'le cheval de zeus',
        })
        .then(({ total }) => total),
    ).toBe(2);
  });
});
