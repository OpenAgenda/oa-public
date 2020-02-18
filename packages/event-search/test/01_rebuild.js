'use strict';

const _ = require('lodash');
const fs = require('fs');
const should = require('should');
const config = require('../testconfig');
const Service = require('../');

describe('01 - event-search - functional: rebuild', function() {

  describe('basic usage', function() {

    const totalEvents = 30;
    let service;

    this.timeout(30000);

    async function eventsList(lastId, limit) {
      return JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/01_events.${lastId}.${limit}.json`)
      );
    }

    before(() => {
      service = Service(config);
    });

    describe('set rebuild', function() {

      describe('simple', () => {
        let result;

        before(async () => {
          try {
            await service.getConfig().client.indices.delete({ index: 'test' })
          } catch (e) {}
        });

        before(async () => {
          result = await service('someagendaidentifier').rebuild({
            eventsList
          });
        });

        it('index is created if not existing', async () => {
          const r = await service.getConfig().client.indices.exists({ index: 'test' });
          r.body.should.equal(true);
        });

        it('a rebuild accounts for 4 main operations if index is created', () => {
          result.operations.length.should.equal(4);
        });

      });

      describe('with deletions', () => {
        let result;

        before(async () => {
          try {
            await service.getConfig().client.indices.delete({ index: 'test' })
          } catch (e) {}
        });

        before(async () => {
          await service('someagendaidentifier').rebuild({
            eventsList
          });
        });

        before(async () => {
          result = await service('someagendaidentifier').rebuild({
            eventsList: async (lastId, limit) => {
              const payload = JSON.parse(
                fs.readFileSync(`${__dirname}/fixtures/01_events.${lastId}.${limit}.json`)
              );
              payload.events.pop(); // removing an event
              return payload;
            }
          });
        });

        it('result provides updates count', () => {
          result.counts.updated.should.equal(27);
        });

        it('result provides deleted count', () => {
          result.counts.deleted.should.equal(3);
        });

      });

    });

  });

});
