import Service from '../index.js';
import config from '../testconfig.js';

describe('07 - event-search - functional: user-bound uids above Int32', () => {
  let service;

  const bigintOwnerUid = 52032468015895;
  const bigintMemberUid = 158937739602338;

  const baseTimings = [
    {
      begin: new Date('2027-04-20T12:00:00+0100'),
      end: new Date('2027-04-20T13:00:00+0100'),
    },
  ];

  beforeAll(async () => {
    service = Service(config);
    try {
      await service.getConfig().client.indices.delete({ index: 'test' });
    } catch (e) {
      // ignore — index may not exist
    }
  });

  describe('rebuild with a single event carrying bigint ownerUid and member.uid', () => {
    let result;

    beforeAll(async () => {
      result = await service('07_bigint').rebuild({
        eventsList: async (lastId) => {
          if (lastId === 0) {
            return {
              lastId: 1,
              events: [
                {
                  uid: 1223897,
                  ownerUid: bigintOwnerUid,
                  member: { uid: bigintMemberUid, role: 1 },
                  title: { fr: 'Event with bigint user-bound uids' },
                  description: {
                    fr: 'ownerUid and member.uid beyond Int32 range',
                  },
                  timings: baseTimings,
                  timezone: 'Europe/Paris',
                  state: 2,
                },
              ],
            };
          }
          return { lastId: -1, events: [] };
        },
      });
    });

    it('rebuild indexes the event without bulk failure', () => {
      expect(result.error).toBeNull();
      expect(result.counts.errored).toBe(0);
      expect(result.counts.created).toBe(1);
    });
  });

  describe('rebuild does not abort the whole agenda on a poisoned doc', () => {
    let result;

    // Inject an event that ES will reject (wrong type on a strictly-mapped
    // field) to mimic a real-world poison doc, then a healthy event after it.
    // Before the fix, rebuild.js would throw on the first bulk error and
    // never process the healthy event sitting at a later lastId.
    beforeAll(async () => {
      result = await service('07_resilient').rebuild({
        eventsList: async (lastId) => {
          if (lastId === 0) {
            return {
              lastId: 1,
              events: [
                {
                  uid: 9999001,
                  ownerUid: bigintOwnerUid,
                  state: 'not-an-integer-on-purpose',
                  title: { fr: 'Poison doc' },
                  description: { fr: 'state typed as keyword breaks the doc' },
                  timings: baseTimings,
                  timezone: 'Europe/Paris',
                },
              ],
            };
          }
          if (lastId === 1) {
            return {
              lastId: 2,
              events: [
                {
                  uid: 9999002,
                  ownerUid: bigintOwnerUid,
                  state: 2,
                  title: { fr: 'Healthy doc' },
                  description: {
                    fr: 'should be indexed even though previous batch had a failure',
                  },
                  timings: baseTimings,
                  timezone: 'Europe/Paris',
                },
              ],
            };
          }
          return { lastId: -1, events: [] };
        },
      });
    });

    it('reports the poisoned doc as errored', () => {
      expect(result.counts.errored).toBe(1);
    });

    it('still indexes the healthy doc from a later batch', () => {
      expect(result.error).toBeNull();
      expect(result.counts.created).toBe(1);
    });
  });
});
