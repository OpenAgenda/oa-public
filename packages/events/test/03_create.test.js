import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  createReadStream,
  createWriteStream,
  copyFile,
  existsSync,
} from 'node:fs';
import Files from '@openagenda/files';

import ValidationError from '../lib/ValidationError.js';

import { service as config, dependencies as dConfig } from '../testconfig.js';

import Service from '../index.js';
import fixtures from './fixtures/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TMP_IMG_PATH = '/tmp/eventTestImage.png';

const data = {
  title: 'An event',
  description: 'A description',
  attendanceMode: 2,
  onlineAccessLink: 'https://openagenda.com',
  timings: [
    {
      begin: '2020-11-30T08:00:00.000Z',
      end: '2020-11-30T10:00:00.000Z',
    },
  ],
  conditions: 'Free',
  keywords: ['One', 'Two', 'Three'],
};

describe('events - functional - create', () => {
  const f = fixtures(config.mysql, config.schema);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      imagePath: config.imagePath,
    });
  });

  describe('simple create', () => {
    let created;

    beforeAll(async () => {
      try {
        created = await svc.create(data);
      } catch (e) {
        // console.log(e);
      }
    });

    it('result is created event', () => {
      expect(created.title.en).toBe('An event');
    });

    it('entry is added in table', async () => {
      const title = await f
        .client('event_2')
        .first(['title'])
        .where('uid', created.uid)
        .then((r) => r.title);

      expect(title).toBe('{"en":"An event"}');
    });

    it('conditions and keywords are set', () => {
      expect(created.conditions.en).toBe('Free');

      expect(created.keywords).toEqual({
        en: ['One', 'Two', 'Three'],
      });
    });

    it('if timezone is not specified, defaults to Europe/Paris', async () => {
      expect(created.timezone).toBe('Europe/Paris');
    });
  });

  describe('create with image', () => {
    let imageTestsSvc;

    beforeAll(
      () =>
        new Promise((done) => {
          createReadStream(`${__dirname}/fixtures/images/dog.png`)
            .pipe(createWriteStream('/tmp/dog.png'))
            .on('close', done);
        }),
    );

    beforeAll(
      () =>
        new Promise((done) => {
          createReadStream(`${__dirname}/fixtures/images/notanimage.txt`)
            .pipe(createWriteStream('/tmp/notanimage.txt'))
            .on('close', done);
        }),
    );

    beforeAll(() => {
      imageTestsSvc = Service({
        knex: f.client,
        Files: Files(dConfig.files),
        imagePath: config.imagePath,
      });
    });

    it('image is uploaded', async () => {
      const created = await imageTestsSvc.create({
        title: 'An online event with an image',
        description: 'Joyful dog',
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        timings: [
          {
            begin: '2020-12-22T11:35:00.000+0200',
            end: '2020-12-22T13:30:00.000+0200',
          },
        ],
        image: createReadStream('/tmp/dog.png'),
      });

      expect(
        await fetch(`${config.imagePath}${created.image.filename}`, {
          method: 'HEAD',
        }).then((r) => r.status),
      ).toBe(200);
    });

    it('validation error is thrown when unknown image format is provided', async () => {
      const error = await imageTestsSvc
        .create({
          title: 'Event create given a text stream instead of image',
          description: 'Nope',
          attendanceMode: 2,
          onlineAccessLink: 'https://openagenda.com',
          timings: [
            {
              begin: '2020-12-22T11:35:00.000+0200',
              end: '2020-12-22T13:30:00.000+0200',
            },
          ],
          image: createReadStream('/tmp/notanimage.txt'),
        })
        .catch((e) => e);

      expect(error instanceof ValidationError).toBeTruthy();
    });

    it('image at null is no image at all', async () => {
      expect(
        await imageTestsSvc
          .create({
            title: 'Event create given a text stream instead of image',
            description: 'Nope',
            image: null,
            attendanceMode: 2,
            onlineAccessLink: 'https://openagenda.com',
            timings: [
              {
                begin: '2020-12-22T11:35:00.000+0200',
                end: '2020-12-22T13:30:00.000+0200',
              },
            ],
          })
          .then(({ image }) => image),
      ).toBe(null);
    });

    it('image can be passed as a non-encoded url (and as a encoded url)', async () => {
      const event = await imageTestsSvc.create({
        ...data,
        image: {
          url: 'https://lerize.villeurbanne.fr/wp-content/uploads/2023/01/230303_YaminaBenahmeddaho_©Francesca_Mantovani_editions_Gallimard-scaled.jpg',
        },
      });

      const response = await fetch(
        `${config.imagePath}${event.image.filename}`,
        {
          method: 'HEAD',
        },
      );
      expect(response.status).toBe(200);
    });

    it('validation error is thrown when malformed url is provided for image', async () => {
      const error = await imageTestsSvc
        .create({
          ...data,
          image: { url: '%C4%97%' },
        })
        .then(
          () => {},
          (e) => e,
        );

      expect(error.name).toBe('ValidationError');
    });

    it('validation error is thrown when invalid url is provided for image', async () => {
      let error;
      try {
        await imageTestsSvc.create({
          ...data,
          image: {
            url: 'https://cdn.openagenda.com/static/onda-185.png',
          },
        });
      } catch (e) {
        error = e;
      }
      expect(error instanceof ValidationError).toBeTruthy();
    });

    it('image can be passed through a local file path, deleted after upload', () =>
      new Promise((done) => {
        copyFile(
          `${__dirname}/fixtures/images/dog.png`,
          TMP_IMG_PATH,
          async () => {
            const event = await imageTestsSvc.create({
              ...data,
              image: {
                path: TMP_IMG_PATH,
              },
            });

            expect(typeof event.image.filename).toBe('string');
            expect(existsSync(TMP_IMG_PATH)).toBe(false);

            done();
          },
        );
      }));
  });

  describe('timings', () => {
    it('using datehourminutes format', async () => {
      const event = await svc.create({
        title: 'Event with datehourminutes timing',
        description: 'Nope',
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        timings: [
          {
            begin: {
              date: '2020-10-21',
              hours: 20,
              minutes: 10,
            },
            end: {
              date: '2020-10-21',
              hours: 21,
              minutes: 5,
            },
          },
        ],
      });

      expect(event.timings[0].begin).toBe('2020-10-21T20:10:00.000+02:00');
    });

    it('fix: DHM timing with hours value at 0 is valid', async () => {
      const event = await svc.create({
        title: 'Event with datehourminutes timing',
        description: 'Nope',
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        timings: [
          {
            begin: {
              date: '2020-10-21',
              hours: 0,
              minutes: 0,
            },
            end: {
              date: '2020-10-21',
              hours: 23,
              minutes: 59,
            },
          },
        ],
      });

      expect(event).toBeTruthy();
    });

    it('if timezone is unspecified but location object with timezone is provided, location timezone is used', async () => {
      const created = await svc.create({
        ...data,
        location: {
          ...data.location,
          timezone: 'America/Vancouver',
        },
      });

      expect(created.timezone).toBe('America/Vancouver');
    });

    it('if timezone is specified, it is preferred over timezone present in location object', async () => {
      const created = await svc.create({
        ...data,
        timezone: 'Asia/Tokyo',
        location: {
          ...data.location,
          timezone: 'America/Vancouver',
        },
      });

      expect(created.timezone).toBe('Asia/Tokyo');
    });

    it('timings must have a duration', async () => {
      const error = await svc
        .create({
          title: 'Event create given a text stream instead of image',
          description: 'Nope',
          attendanceMode: 2,
          onlineAccessLink: 'https://openagenda.com',
          timings: [
            {
              begin: '2022-01-09T11:00:00.000+0200',
              end: '2022-01-09T11:00:00.000+0200',
            },
          ],
        })
        .catch((e) => e);

      expect(error instanceof ValidationError).toBe(true);
    });

    it('timings are written down in db in event timezone when in DHM', async () => {
      const event = await svc.create({
        title: 'Event create given a text stream instead of image',
        description: 'Nope',
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        timezone: 'Europe/Paris',
        timings: [
          {
            begin: {
              date: '2023-07-20',
              hours: 12,
              minutes: 0,
            },
            end: {
              date: '2023-07-20',
              hours: 23,
              minutes: 0,
            },
          },
        ],
      });

      expect(event.timings).toEqual([
        {
          begin: '2023-07-20T12:00:00.000+02:00',
          end: '2023-07-20T23:00:00.000+02:00',
        },
      ]);
    });

    it('timings are provided as string written down in db in event timezone', async () => {
      const event = await svc.create({
        title: 'Event create given a text stream instead of image',
        description: 'Nope',
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        timezone: 'Europe/Paris',
        timings: [
          {
            begin: '2025-10-28T20:30:00',
            end: '2025-10-28T22:20:00',
          },
        ],
      });

      expect(event.timings).toEqual([
        {
          begin: '2025-10-28T20:30:00.000+01:00',
          end: '2025-10-28T22:20:00.000+01:00',
        },
      ]);
    });

    it('timings are provided as date written down in db in event timezone', async () => {
      const event = await svc.create({
        title: 'Event create given a text stream instead of image',
        description: 'Nope',
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        timezone: 'Europe/Paris',
        timings: [
          {
            begin: new Date('2025-10-23T14:11:00.000Z'),
            end: new Date('2025-10-23T15:11:00.000Z'),
          },
        ],
      });

      expect(new Date(event.timings[0].begin)).toEqual(
        new Date('2025-10-23T16:11:00.000+02:00'),
      );
    });

    it('timings are provided without begin timing', async () => {
      const error = await svc
        .create({
          title: 'Event create given a text stream instead of image',
          description: 'Nope',
          attendanceMode: 2,
          onlineAccessLink: 'https://openagenda.com',
          timezone: 'Europe/Paris',
          timings: [
            {
              begin: null,
              end: new Date('2025-10-23T15:11:00.000Z'),
            },
          ],
        })
        .catch((e) => e);

      expect(error instanceof ValidationError).toBe(true);
    });

    it('timings are written down in db in event timezone when in YMHThms format', async () => {
      const event = await svc.create({
        title: 'Event create given a text stream instead of image',
        description: 'Nope',
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        timezone: 'Europe/Paris',
        timings: [
          {
            begin: '2023-07-20T12:00:00.000+02:00',
            end: '2023-07-20T23:00:00.000+02:00',
          },
        ],
      });

      expect(event.timings).toEqual([
        {
          begin: '2023-07-20T12:00:00.000+02:00',
          end: '2023-07-20T23:00:00.000+02:00',
        },
      ]);
    });
  });

  describe('other', () => {
    it('create with private option results in private event', async () => {
      const event = await svc.create(data, { private: true });

      const isPrivate = await f
        .client('event_2')
        .first(['private'])
        .where('uid', event.uid)
        .then((r) => r.private);

      expect(isPrivate).toBeTruthy();
    });

    it('fileKey is defined at create', async () => {
      const event = await svc.create(data);

      const fileKey = await f
        .client('event_2')
        .first(['file_key'])
        .where('uid', event.uid)
        .then((r) => r.file_key);

      expect(fileKey.length).toBe(32);
    });

    it('fileKey can be passed through options at create', async () => {
      const event = await svc.create(data, { fileKey: 'blaireau' });

      const fileKey = await f
        .client('event_2')
        .first(['file_key'])
        .where('uid', event.uid)
        .then((r) => r.file_key);

      expect(fileKey).toBe('blaireau');
    });

    it('draft create does not require all fields to be specified', async () => {
      expect(
        typeof await svc
          .create(
            {
              title: 'Un titre',
            },
            { draft: true },
          )
          .then(({ uid }) => uid),
      ).toBe('number');
    });

    it('slug from title containing unhandled characters provides randomized result of same length', async () => {
      const title = '🍽 𝗟𝗔 𝗡𝗢𝗖𝗧𝗨𝗥𝗡𝗘 𝗚𝗢𝗨𝗥𝗠𝗔𝗡𝗗𝗘 🌙';
      const draft = await svc.create({ title }, { draft: true });
      expect(draft.slug.length).toBe(title.length);
    });

    it('draft create does not required title to be specified', async () => {
      const event = await svc.create(
        {
          description: 'Une description',
        },
        { draft: true },
      );

      expect(event.title).toBeUndefined();
    });

    it('registration is stored as a list of { type, value } objects', async () => {
      const event = await svc.create(
        {
          registration: ['inscriptions@oagenda.com'],
        },
        { draft: true },
      );

      const parsedRegistrationColValue = await f
        .client('event_2')
        .first('registration')
        .where('uid', event.uid)
        .then((r) => JSON.parse(r.registration));

      expect(parsedRegistrationColValue).toEqual([
        {
          type: 'email',
          value: 'inscriptions@oagenda.com',
        },
      ]);
    });

    it('when HTML is provided to long description, it is converted to markdown', async () => {
      const event = await svc.create(
        {
          longDescription: '<b>This should not be HTML</b>',
        },
        { draft: true },
      );

      expect(
        await f
          .client('event_2')
          .first('long_description')
          .where('uid', event.uid)
          .then((r) => JSON.parse(r.long_description).en),
      ).toBe('**This should not be HTML**');
    });

    it('when HTML is provided to short description, it is converted to markdown.', async () => {
      const event = await svc.create(
        {
          description: '<b>This should not be HTML</b>',
        },
        { draft: true },
      );

      expect(
        await f
          .client('event_2')
          .first('description')
          .where('uid', event.uid)
          .then((r) => JSON.parse(r.description).en),
      ).toBe('**This should not be HTML**');
    });

    it('end of line are replaced by spaces in short description', async () => {
      const event = await svc.create(
        {
          description: 'There should not be any\nnew\r\nlines',
        },
        { draft: true },
      );

      expect(
        await f
          .client('event_2')
          .first('description')
          .where('uid', event.uid)
          .then((r) => JSON.parse(r.description).en),
      ).toBe('There should not be any new lines');
    });

    it('timezone validation', async () => {
      const error = await svc
        .create(
          {
            timezone: 'UTC+1',
          },
          { draft: true },
        )
        .catch((e) => e);

      expect(error instanceof ValidationError).toBeTruthy();
      expect(error.info.errors[0].code).toBe('timezone.invalid');
    });

    it('provided context is passed to interface call', () =>
      new Promise((done) => {
        const onCreate = (_, context) => {
          expect(context.agendaUid).toBe(123);
          done();
        };

        const svcForContextTest = Service({
          knex: f.client,
          interfaces: {
            onCreate,
          },
        });

        svcForContextTest.create(data, {
          context: {
            agendaUid: 123,
          },
        });
      }));

    it('agendaUid is associated to created event when passed in context', async () => {
      const event = await svc.create(data, {
        context: {
          agendaUid: 123,
        },
      });

      expect(event.agendaUid).toBe(123);
    });

    it('location can be provided as object', async () => {
      const event = await svc.create({
        ...data,
        attendanceMode: 1,
        location: {
          uid: 123,
        },
      });

      expect(event.locationUid).toBe(123);
    });

    it('if userUid is provided in context, it is added as creatorUid and ownerUid of event', async () => {
      const event = await svc.create(data, {
        context: {
          userUid: 123,
        },
        access: 'internal',
      });

      expect(event.creatorUid).toBe(123);
      expect(event.ownerUid).toBe(123);
    });

    it('if an interface returns a promise, it will be waited upon', async () => {
      let calledOnCreate = false;

      const interfaceTestSvc = Service({
        knex: f.client,
        interfaces: {
          onCreate: async () => {
            await new Promise((rs) => setTimeout(rs, 10));
            calledOnCreate = true;
          },
        },
      });

      await interfaceTestSvc.create(data);

      expect(calledOnCreate).toBe(true);
    });

    it('with extIds', async () => {
      const event = await svc.create({
        ...data,
        extIds: [{ key: 'apidae', value: '2398772398' }],
      });

      expect(event.extIds).toStrictEqual([
        { key: 'apidae', value: '2398772398' },
      ]);
    });

    it('unsafe markown in longDesc', async () => {
      let error;
      try {
        await svc.create({
          ...data,
          longDescription: '[X](javascript:alert(1))',
        });
      } catch (e) {
        error = e;
      }
      expect(error instanceof ValidationError).toBeTruthy();
      expect(error.info.errors[0].code).toBe('longDescription.invalid');
    });
  });
});
