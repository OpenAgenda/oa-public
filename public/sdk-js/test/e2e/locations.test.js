import { jest, describe, it } from '@jest/globals';
import { OaSdk } from '../../src/index.js';
import testconfig from '../../testconfig.js';

describe('locations', () => {
  jest.setTimeout(10000);

  let oa;
  let createdLocation;

  beforeAll(() => {
    oa = new OaSdk({
      publicKey: testconfig.publicKey,
      secretKey: testconfig.secretKey,
    });
  });

  beforeEach(() => {
    createdLocation = null;
  });

  afterEach(async () => {
    if (createdLocation) {
      await oa.locations.delete(testconfig.agendaUid, createdLocation.uid);
    }
  });

  it('create a location', async () => {
    createdLocation = await oa.locations.create(testconfig.agendaUid, {
      name: 'Verdun',
      address: 'Verdun',
      countryCode: 'fr',
    });

    expect(typeof createdLocation.uid).toBe('number');
  });

  it('fails to create a location', async () => {
    await expect(
      oa.locations.create(testconfig.agendaUid, {
        name: 'Verdun',
        address: 'Verdun',
      }),
    ).rejects.toMatchObject({
      response: {
        data: {
          errors: [
            {
              code: 'required',
              field: 'countryCode',
              message: 'a string is required',
            },
            {
              code: 'latitude.invalid',
              field: 'latitude',
              message: 'not a number',
            },
            {
              code: 'longitude.invalid',
              field: 'longitude',
              message: 'not a number',
            },
          ],
        },
      },
    });
  });

  it('get a location', async () => {
    createdLocation = await oa.locations.create(testconfig.agendaUid, {
      name: 'Verdun',
      address: 'Verdun',
      countryCode: 'fr',
    });

    const location = await oa.locations.get(
      testconfig.agendaUid,
      createdLocation.uid,
    );

    expect(parseInt(location.uid, 10)).toBe(createdLocation.uid);
  });

  it('list locations', async () => {
    createdLocation = await oa.locations.create(testconfig.agendaUid, {
      name: 'Verdun',
      address: 'Verdun',
      countryCode: 'fr',
    });

    const { total, locations, after } = await oa.locations.list(
      testconfig.agendaUid,
      { size: 1, sort: 'updatedAt.desc' },
    );

    expect(typeof total).toBe('number');

    expect(typeof after).toBe('number');

    expect(locations).toBeInstanceOf(Array);
    expect(locations).toHaveLength(1);
    expect(locations[0].uid).toBe(createdLocation.uid);
  });

  it('patch a location', async () => {
    createdLocation = await oa.locations.create(testconfig.agendaUid, {
      name: 'Verdun',
      address: 'Verdun',
      countryCode: 'fr',
    });

    const updatedLocation = await oa.locations.patch(
      testconfig.agendaUid,
      createdLocation.uid,
      {
        name: 'Nouveau nom',
      },
    );

    expect(typeof createdLocation.uid).toBe('number');
    expect(createdLocation.name).toBe('Verdun');
    expect(updatedLocation.name).toBe('Nouveau nom');
  });

  it('update a location', async () => {
    createdLocation = await oa.locations.create(testconfig.agendaUid, {
      name: 'Verdun',
      address: 'Verdun',
      countryCode: 'fr',
    });

    const patchedLocation = await oa.locations.update(
      testconfig.agendaUid,
      createdLocation.uid,
      {
        ...createdLocation,
        name: 'Nouveau nom',
      },
    );

    expect(typeof createdLocation.uid).toBe('number');
    expect(createdLocation.name).toBe('Verdun');
    expect(patchedLocation.name).toBe('Nouveau nom');
  });

  it('delete a location', async () => {
    const location = await oa.locations.create(testconfig.agendaUid, {
      name: 'Verdun',
      address: 'Verdun',
      countryCode: 'fr',
    });

    const deletedLocation = await oa.locations.delete(
      testconfig.agendaUid,
      location.uid,
    );

    expect(typeof location.uid).toBe('number');
    expect(deletedLocation.uid).toBe(location.uid);
  });
});
