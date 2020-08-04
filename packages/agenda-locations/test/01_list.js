'use strict';

const _ = require('lodash');
const assert = require('assert');

const config = require('../testconfig');
const fixtures = require('./fixtures/load');
const Service = require('../bisounours');
const fields = require('../bisounours/lib/fields.json');

describe('agenda-locations - functional - list', () => {
  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      imagePath: '//cibuldev.s3.amazonaws.com/',
      interfaces: {
        getAgendaIdByUid: async id => ({
          25221: 7196947
        })[id],
        getEventCounts: async (locationUids, { agendaUid }) => [{
          uid: 60763721,
          eventCount: 12,
          agendaEventCount: 8
        }, {
          uid: 51665985,
          eventCount: 9,
          agendaEventCount: 2
        }]
      }
    });
  });

  describe('defaults', () => {
    let items;

    before(async () => {
      items = await svc(7196947).list();
    });

    it('list paginates by 20', async () => {
      assert.equal(items.length, 20);
    });

    it('id is not provided', async () => {
      assert.equal(items[0].id, undefined);
    });

    it('order is by descending id', async () => {
      assert.deepEqual(items.map(i => i.uid), [
        60763721,
        7630649,
        51665985,
        30433085,
        87316763,
        32049550,
        41253007,
        27638359,
        91723136,
        79091381,
        56366303,
        94482437,
        80369196,
        60725900,
        7749634,
        24334735,
        54251470,
        12084144,
        56924239,
        56511938
      ]);
    });

    it('provided fields by default are name, address, latitude and longitude', () => {
      assert.deepEqual(Object.keys(items[0]), ['uid', 'name', 'address', 'latitude', 'longitude']);
    });

  });

  describe('filters', () => {
    it('"search" queries region field', async () => {
      const items = await svc(7196947).list({ search: 'nom de région' });

      assert.equal(items.length, 1);
      assert.equal(items[0].name, 'Abbatiale Sainte-Marie');
    });

    it('"search" queries department field', async () => {
      const items = await svc(7196947).list({ search: 'nom de département' });

      assert.equal(items.length, 1);
      assert.equal(items[0].name, 'Abbatiale Sainte-Marie');
    });

    it('"state" filters verified or unverified locations', async () => {
      const verified = await svc(7196947).list({ state: 1 }, {}, { detailed: true });
      const unverified = await svc(7196947).list({ state: 0 }, {}, { detailed: true });

      assert.equal(verified.length, verified.filter(l => l.state === 1).length);
      assert.equal(unverified.length, unverified.filter(l => l.state === 0).length);
    });

    it('"uids" filters by provided location uid list', async () => {
      const uids = [
        76248298,
        10175539,
        75940684
      ];

      const selection = await svc(7196947).list({ uids });

      assert.equal(selection.length, 3);
      assert.deepEqual(selection.map(l => l.uid), uids);
    });

  });

  describe('other', () => {

    it('if getEventCounts interface is set and eventCount option is true, result includes interface-provided counts', async () => {
      const items = await svc(7196947).list({}, { limit: 3 }, { eventCounts: true });

      assert.deepEqual(
        items.map(i => _.pick(i, ['uid', 'eventCount', 'agendaEventCount'])),
        [{
          uid: 60763721,
          eventCount: 12,
          agendaEventCount: 8
        }, {
          uid: 7630649,
          eventCount: 0,
          agendaEventCount: 0
        }, {
          uid: 51665985,
          eventCount: 9,
          agendaEventCount: 2
        }]
      );
    });

    it('if total option is provided, list returns an { items, total } object', async () => {
      const {
        items,
        total
      } = await svc(7196947).list({}, {}, { total: true });

      assert.equal(total, 364);
    });

    it('if detailed option is provided, all public fields are given', async () => {
      const items = await svc(7196947).list({}, {}, { detailed: true });
      assert.deepEqual(
        Object.keys(items[0]),
        fields.filter(f => f.read.includes('public')).map(f => f.field)
      );
    });
  });

});
