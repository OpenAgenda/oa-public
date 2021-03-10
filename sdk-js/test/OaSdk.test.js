import _ from 'lodash';
import sinon from 'sinon';
import moment from 'moment';
import OaSdk from '../src';
import testconfig from '../testconfig';

describe('connection', () => {
  jest.setTimeout(10000);

  it('simple connect', async () => {
    const oa = new OaSdk({ secretKey: testconfig.secretKey });
    await oa.connect();

    expect(oa.accessToken).toHaveLength(32);
  });

  it('simple connect - key provided on connect', async () => {
    const oa = new OaSdk();
    await oa.connect(testconfig.secretKey);

    expect(oa.accessToken).toHaveLength(32);
  });

  it('fail connection', async () => {
    const oa = new OaSdk();

    await expect(oa.connect('inexistant')).rejects.toThrow('Forbidden');
  });
});

describe('refresh expired token', () => {
  it('refresh token if needed', async () => {
    const oa = new OaSdk();

    const spy = sinon.spy(oa, 'connect');

    await oa.connect(testconfig.secretKey);

    const clock = sinon.useFakeTimers(Date.now());

    await oa.events.get(12345678);

    expect(spy.callCount).toBe(1);

    clock.tick(oa.expiresIn * 1000);

    await oa.events.get(12345678);

    expect(spy.callCount).toBe(2);

    clock.restore();
  });
});

describe.skip('locations', () => {
  it('create a location', async () => {
    const oa = new OaSdk({ secretKey: testconfig.secretKey });
    await oa.connect();

    const location = await oa.locations.create(testconfig.agendaUid, {
      name: 'Gare Meuse TGV',
      address: 'Lieu dit Le Cugnet, 55220 Les Trois-Domaines',
      latitude: 48.9736458,
      longitude: 5.2723537,
    });

    expect(location).toMatchObject({
      uid: expect.any(Number),
    });
  });

  it('fails to create a location', async () => {
    const oa = new OaSdk({ secretKey: testconfig.secretKey });
    await oa.connect();

    await expect(
      oa.locations.create(testconfig.agendaUid, {
        name: 'Gare Meuse TGV',
        address: 'Lieu dit Le Cugnet, 55220 Les Trois-Domaines',
      })
    ).rejects.toMatchObject({
      response: {
        body: {
          error: 'invalid_request',
          error_description:
            'latitude: Latitude is required, longitude: Longitude is required',
        },
      },
    });
  });
});

describe('events', () => {
  it('create & delete an event', async () => {
    const oa = new OaSdk({ secretKey: testconfig.secretKey });
    await oa.connect();

    const { success, event } = await oa.events.create(testconfig.agendaUid, {
      slug: `a-title-${_.random(10 ** 6)}`,
      title: {
        fr: 'Un titre',
        en: 'A title',
      },
      description: {
        fr: 'On va faire un truc',
        en: 'We make a truc',
      },
      locationUid: 78372099,
      timings: [
        {
          begin: moment(),
          end: moment().add(1, 'hour'),
        },
        {
          begin: moment().add(1, 'day'),
          end: moment().add(1, 'day').add(1, 'hour'),
        },
      ],
    });

    expect(success).toBeTruthy();
    expect(typeof event.uid).toBe('number');
    expect(event.title.fr).toBe('Un titre');
  });

  it('create & delete an event - with keywords', async () => {
    const oa = new OaSdk({ secretKey: testconfig.secretKey });
    await oa.connect();

    const { success, event } = await oa.events.create(testconfig.agendaUid, {
      slug: `a-title-${_.random(10 ** 6)}`,
      title: {
        fr: 'Un titre',
        en: 'A title',
      },
      description: {
        fr: 'On va faire un truc',
        en: 'We make a truc',
      },
      locationUid: 78372099,
      timings: [
        {
          begin: moment(),
          end: moment().add(1, 'hour'),
        },
        {
          begin: moment().add(1, 'day'),
          end: moment().add(1, 'day').add(1, 'hour'),
        },
      ],
      keywords: {
        fr: [
          'Toulouse',
          'Toulouse Centre',
          'Culture',
          'Exposition',
          'Tout public',
        ],
      },
    });

    expect(success).toBeTruthy();
    expect(typeof event.uid).toBe('number');
    expect(event.title.fr).toBe('Un titre');

    await oa.events.delete(testconfig.agendaUid, event.uid);
  });

  it('fails to create an event', async () => {
    const oa = new OaSdk({ secretKey: testconfig.secretKey });
    await oa.connect();

    await expect(
      oa.events.create(testconfig.agendaUid, {
        slug: `a-title-${_.random(10 ** 6)}`,
        description: {
          fr: 'On va faire un truc',
          en: 'We make a truc',
        },
        locationUid: 78372099,
        timings: [
          {
            begin: moment(),
            end: moment().add(1, 'hour'),
          },
          {
            begin: moment().add(1, 'day'),
            end: moment().add(1, 'day').add(1, 'hour'),
          },
        ],
      })
    ).rejects.toMatchObject({
      response: {
        body: {
          errors: [
            {
              code: 'required',
              field: 'title',
              lang: 'fr',
              message: 'a string is required',
              origin: '',
              step: 'validation',
            },
            {
              code: 'required',
              field: 'title',
              lang: 'en',
              message: 'a string is required',
              origin: '',
              step: 'validation',
            },
          ],
        },
      },
    });
  });

  it('get an event', async () => {
    const oa = new OaSdk({
      publicKey: testconfig.publicKey,
      secretKey: testconfig.secretKey,
    });

    await oa.connect();

    const { event: createdEvent } = await oa.events.create(
      testconfig.agendaUid,
      {
        slug: `a-title-${_.random(10 ** 6)}`,
        title: {
          fr: 'Un titre',
          en: 'A title',
        },
        description: {
          fr: 'On va faire un truc',
          en: 'We make a truc',
        },
        locationUid: 78372099,
        timings: [
          {
            begin: moment(),
            end: moment().add(1, 'hour'),
          },
          {
            begin: moment().add(1, 'day'),
            end: moment().add(1, 'day').add(1, 'hour'),
          },
        ],
      }
    );

    const event = await oa.events.get(createdEvent.uid);

    expect(parseInt(event.uid, 10)).toBe(createdEvent.uid);

    await oa.events.delete(testconfig.agendaUid, createdEvent.uid);
  });

  it('update an event', async () => {
    const oa = new OaSdk({ secretKey: testconfig.secretKey });
    await oa.connect();

    const { success, event } = await oa.events.create(testconfig.agendaUid, {
      slug: `a-title-${_.random(10 ** 6)}`,
      title: {
        fr: 'Un titre',
        en: 'A title',
      },
      description: {
        fr: 'On va faire un truc',
        en: 'We make a truc',
      },
      locationUid: 78372099,
      timings: [
        {
          begin: moment(),
          end: moment().add(1, 'hour'),
        },
        {
          begin: moment().add(1, 'day'),
          end: moment().add(1, 'day').add(1, 'hour'),
        },
      ],
    });

    const { event: updatedEvent } = await oa.events.update(
      testconfig.agendaUid,
      event.uid,
      {
        slug: event.slug,
        title: {
          fr: 'Titre mise à jour',
          en: 'Updated title',
        },
        timings: event.timings,
      }
    );

    expect(success).toBeTruthy();
    expect(typeof event.uid).toBe('number');
    expect(event.title.fr).toBe('Un titre');
    expect(updatedEvent.title.fr).toBe('Titre mise à jour');

    await oa.events.delete(testconfig.agendaUid, event.uid);
  });
});
