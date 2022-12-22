'use strict';

const fs = require('fs');
const Service = require('..');
const config = require('../testconfig');

describe('01 - event-search - functional: rebuild', () => {
  describe('basic usage', () => {
    let service;

    async function eventsList(lastId, limit) {
      return JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/01_events.${lastId}.${limit}.json`),
      );
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
          const r = await service.getConfig().client.indices.exists({ index: 'test' });
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
              const payload = JSON.parse(
                fs.readFileSync(`${__dirname}/fixtures/01_events.${lastId}.${limit}.json`),
              );
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
    });
  });
});
