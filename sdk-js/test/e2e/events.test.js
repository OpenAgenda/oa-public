import _ from 'lodash';
import moment from 'moment';
import OaSdk from '../../src';
import testconfig from '../../testconfig';

describe('events', () => {
  jest.setTimeout(10000);

  let oa;
  let createdEvent;

  beforeAll(() => {
    oa = new OaSdk({
      publicKey: testconfig.publicKey,
      secretKey: testconfig.secretKey,
    });
  });

  beforeEach(() => {
    createdEvent = null;
  });

  afterEach(async () => {
    if (createdEvent) {
      await oa.events.delete(testconfig.agendaUid, createdEvent.uid);
    }
  });

  it('create an event', async () => {
    createdEvent = await oa.events.create(testconfig.agendaUid, {
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

    expect(typeof createdEvent.uid).toBe('number');
    expect(createdEvent.title.fr).toBe('Un titre');
  });

  it('create an event - with keywords', async () => {
    createdEvent = await oa.events.create(testconfig.agendaUid, {
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

    expect(typeof createdEvent.uid).toBe('number');
    expect(createdEvent.title.fr).toBe('Un titre');
  });

  it('fails to create an event', async () => {
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
        data: {
          info: {},
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
          message: 'data is invalid',
        }
      }
    });
  });

  it('get an event', async () => {
    createdEvent = await oa.events.create(
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

    const event = await oa.events.get(testconfig.agendaUid, createdEvent.uid);

    expect(parseInt(event.uid, 10)).toBe(createdEvent.uid);
  });

  it('get an event - publicKey only', async () => {
    createdEvent = await oa.events.create(
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

    const oaPublic = new OaSdk({ publicKey: testconfig.publicKey });

    const event = await oaPublic.events.get(testconfig.agendaUid, createdEvent.uid);

    expect(parseInt(event.uid, 10)).toBe(createdEvent.uid);
  });

  it('list events', async () => {
    createdEvent = await oa.events.create(
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

    const {
      total,
      events,
      after
    } = await oa.events.list(
      testconfig.agendaUid,
      { size: 1, sort: 'updatedAt.desc' }
    );

    expect(typeof total).toBe('number');

    expect(after).toBeInstanceOf(Array);
    expect(after).toHaveLength(2);

    expect(events).toBeInstanceOf(Array);
    expect(events).toHaveLength(1);
    expect(events[0].uid).toBe(createdEvent.uid);
  });

  it('patch an event', async () => {
    createdEvent = await oa.events.create(testconfig.agendaUid, {
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

    const updatedEvent = await oa.events.patch(
      testconfig.agendaUid,
      createdEvent.uid,
      {
        title: {
          fr: 'Titre mise à jour',
          en: 'Updated title',
        },
      }
    );

    expect(typeof createdEvent.uid).toBe('number');
    expect(createdEvent.title.fr).toBe('Un titre');
    expect(updatedEvent.title.fr).toBe('Titre mise à jour');
  });

  it('update an event', async () => {
    createdEvent = await oa.events.create(testconfig.agendaUid, {
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

    const patchedEvent = await oa.events.update(
      testconfig.agendaUid,
      createdEvent.uid,
      {
        ...createdEvent,
        title: {
          fr: 'Titre mise à jour',
          en: 'Updated title',
        }
      }
    );

    expect(typeof createdEvent.uid).toBe('number');
    expect(createdEvent.title.fr).toBe('Un titre');
    expect(patchedEvent.title.fr).toBe('Titre mise à jour');
  });

  it('update an event - invalid data', async () => {
    createdEvent = await oa.events.create(testconfig.agendaUid, {
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

    await expect(oa.events.update(
      testconfig.agendaUid,
      createdEvent.uid,
      {
        ...createdEvent,
        image: { url: 'https://google.fr' }
      }
    )).rejects.toMatchObject({
      response: {
        data: {
          errors: [{
            code: 'format.unknown',
            field: 'image',
            message: 'provided format is unknown'
          }]
        },
      },
    });
  });

  it('delete an event', async () => {
    const event = await oa.events.create(testconfig.agendaUid, {
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

    const deletedEvent = await oa.events.delete(
      testconfig.agendaUid,
      event.uid,
    );

    expect(typeof event.uid).toBe('number');
    expect(deletedEvent.uid).toBe(event.uid);
  });
});
