import Service from '../index.js';
import config from '../testconfig.js';

describe('01 - event-search - functional: rebuild', () => {
  describe('basic usage', () => {
    let service;

    async function eventsList(lastId, limit) {
      return (
        await import(`./fixtures/01_events.${lastId}.${limit}.json`, {
          with: { type: 'json' },
        })
      ).default;
    }

    beforeAll(() => {
      service = Service(config);
    });

    describe('set rebuild', () => {
      describe('simple', () => {
        let result;

        beforeAll(async () => {
          try {
            await service.getConfig().client.indices.delete({ index: 'test' });
          } catch (e) {
            // ignore error except for troubleshoot
          }
        });

        beforeAll(async () => {
          result = await service('someagendaidentifier').rebuild({
            eventsList,
          });
        });

        it('index is created if not existing', async () => {
          const r = await service
            .getConfig()
            .client.indices.exists({ index: 'test' });
          expect(r.body).toBe(true);
        });

        it('a rebuild accounts for 4 main operations if index is created', () => {
          expect(result.operations.length).toBe(4);
        });
      });

      describe('with deletions', () => {
        let result;

        beforeAll(async () => {
          try {
            await service.getConfig().client.indices.delete({ index: 'test' });
          } catch (e) {
            // ignore error except for troubleshoot
          }
        });

        beforeAll(async () => {
          await service('someagendaidentifier').rebuild({
            eventsList,
          });
        });

        beforeAll(async () => {
          result = await service('someagendaidentifier').rebuild({
            eventsList: async (lastId, limit) => {
              const payload = (
                await import(`./fixtures/01_events.${lastId}.${limit}.json`, {
                  with: { type: 'json' },
                })
              ).default;
              payload.events.pop(); // removing an event
              return payload;
            },
          });
        });

        it('result provides updates count', () => {
          expect(result.counts.updated).toBe(27);
        });

        it('result provides deleted count', () => {
          expect(result.counts.deleted).toBe(3);
        });
      });

      describe('failed build (e.g. a corrupt event) does not prune', () => {
        let totalBefore;
        let result;
        let totalAfter;

        beforeAll(async () => {
          try {
            await service.getConfig().client.indices.delete({ index: 'test' });
          } catch (e) {
            // ignore error except for troubleshoot
          }
        });

        // populate the set with a complete build
        beforeAll(async () => {
          await service('failingset').rebuild({ eventsList });
          ({ total: totalBefore } = await service('failingset').search(
            { state: null },
            { size: 0 },
          ));
        });

        // a rebuild whose event listing rejects partway, simulating a corrupt
        // event that makes a page fetch throw
        beforeAll(async () => {
          result = await service('failingset').rebuild({
            eventsList: async () => {
              throw new Error('corrupt event made the page fetch reject');
            },
          });
          ({ total: totalAfter } = await service('failingset').search(
            { state: null },
            { size: 0 },
          ));
        });

        afterAll(async () => {
          await service('failingset').clear();
        });

        it('surfaces the build error', () => {
          expect(result.error).toBeTruthy();
        });

        it('does not delete anything (prune is skipped)', () => {
          expect(result.counts.deleted).toBe(0);
        });

        it('keeps the previously indexed events intact', () => {
          expect(totalBefore).toBeGreaterThan(0);
          expect(totalAfter).toBe(totalBefore);
        });
      });
    });
  });
});
