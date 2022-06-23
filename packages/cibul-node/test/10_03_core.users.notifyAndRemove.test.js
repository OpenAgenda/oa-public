'use strict';

const promisifyRedis = require('@openagenda/utils/redis/promisify');

const Services = require('../services/init');
const Core = require('../core');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

async function clearRedis(services) {
  const pRedis = promisifyRedis(services.redis);

  const keys = await pRedis.keys('inactiveUsers:*');

  for (const key of keys) {
    await pRedis.del(key);
  }
}

describe('10 - core - functional (server): core.users().remove()', () => {
  let services;
  const stateUpdates = [];
  let result;

  beforeAll(() => loadFixtures(testConfig.db, '019.sql'));

  beforeAll(async () => {
    services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'accessTokens',
        'files',
        'queues',
        'events',
        'agendas',
        'agendaEvents',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'trackers',
        'activities'
      ]
    });

    Core(services, testConfig);

    await services.simpleCache.clearAll();
  });

  beforeAll(() => clearRedis(services));

  beforeAll(async () => {
    const pRedis = promisifyRedis(services.redis);

    await pRedis.set('inactiveUsers:3', JSON.stringify({
      sent: [{
        name: 'first',
        date: '2020-01-01'
      }]
    }));
    await pRedis.set('inactiveUsers:4', JSON.stringify({
      sent: [{
        name: 'first',
        date: '2022-05-01'
      }, {
        name: 'second',
        date: '2022-05-20'
      }]
    }));
    await pRedis.set('inactiveUsers:5', JSON.stringify({
      sent: [{
        name: 'first',
        date: '2022-05-01'
      }, {
        name: 'second',
        date: '2022-05-20'
      }, {
        name: 'last',
        date: '2022-06-05'
      }]
    }));
  });

  beforeAll(async () => {
    result = await services.users.tasks.notifyAndRemove({
      onStateUpdate: data => stateUpdates.push(data),
      send: false
    });
  });

  it('users that have been notified once more than 20 days ago are sent a second email', () => {
    const heleneState = stateUpdates.find(state => state.user.uid === 3).state;

    expect(heleneState.sent.length).toBe(2);
    expect(heleneState.sent[1].name).toBe('second');
  });

  it('users that have been notified two times with last notification made more than 7 days ago are notified a third and last time', () => {
    const margauxState = stateUpdates.find(state => state.user.uid === 4).state;

    expect(margauxState.sent.length).toBe(3);
    expect(margauxState.sent[2].name).toBe('last');
  });

  it('users that have been notified three times with last notification made more than 24 hours ago are deleted', async () => {
    const removedUser = await services.users.get(5, { removed: null, detailed: true });

    expect(removedUser.isRemoved).toBe(true);
  });

  it('result of task gives a count of actions taken', () => {
    expect(result).toEqual({
      processed: 3,
      first: 0,
      second: 1,
      last: 1,
      removals: 1
    });
  });

  it('when none of the users that are in the store are to be processed, new users are loaded', async () => {
    await clearRedis(services);

    const newStateUpdates = [];
    await services.users.tasks.notifyAndRemove({
      onStateUpdate: data => newStateUpdates.push(data),
      send: false
    });

    const jeanBenoitState = newStateUpdates.find(state => state.user.uid === 1).state;

    expect(jeanBenoitState.sent.length).toBe(1);
    expect(jeanBenoitState.sent[0].name).toBe('first');
  });

  it('accounts linked to main domain are not processed', async () => {
    await clearRedis(services);

    const newStateUpdates = [];
    await services.users.tasks.notifyAndRemove({
      onStateUpdate: data => newStateUpdates.push(data),
      send: false
    });

    expect(newStateUpdates.filter(state => state.user.uid === 6).length).toBe(0);
  });
});
