'use strict';

const axios = require('axios');
const fs = require('fs');
const assert = require('assert');
const Files = require('@openagenda/files');
const ValidationError = require('../lib/ValidationError');

const TMP_IMG_PATH = '/tmp/eventTestImage.png';

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('..');
const create = require('../create');

const data = {
  title: 'An event',
  description: 'A description',
  attendanceMode: 2,
  onlineAccessLink: 'https://openagenda.com',
  timings: [{
    begin: '2020-11-30T08:00:00.000Z',
    end: '2020-11-30T10:00:00.000Z'
  }],
  conditions: 'Free',
  keywords: ['One', 'Two', 'Three']
};

describe('events - functional - create', () => {
  const f = fixtures(config.mysql, config.schema);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      imagePath: config.imagePath
    });
  });

  describe('simple create', () => {
    let created;

    beforeAll(async () => {
      try {
        created = await svc.create(data);
      } catch (e) {
        console.log(e);
      }
    });

    it('result is created event', () => {
      assert.equal(created.title.en, 'An event');
    });

    it('entry is added in table', async () => {
      const title = await f.client('event_2')
        .first(['title'])
        .where('uid', created.uid)
        .then(r => r.title)

      assert.equal(title, '{"en":"An event"}');
    });

    it('conditions and keywords are set', () => {
      assert.equal(created.conditions.en, 'Free');

      assert.deepEqual(created.keywords, {
        en: ['One', 'Two', 'Three']
      });
    });

    it('if timezone is not specified, defaults to Europe/Paris', async () => {
      assert.equal(created.timezone, 'Europe/Paris');
    });
  });

  describe('create with image', () => {
    let svc;

    beforeAll(done => {
      fs.createReadStream(`${__dirname}/fixtures/images/dog.png`)
        .pipe(fs.createWriteStream('/tmp/dog.png'))
        .on('close', done)
    });
    
    beforeAll(done => {
      fs.createReadStream(`${__dirname}/fixtures/images/notanimage.txt`)
        .pipe(fs.createWriteStream('/tmp/notanimage.txt'))
        .on('close', done)
    });

    beforeAll(() => {
      svc = Service({
        knex: f.client,
        Files: Files(dConfig.files),
        imagePath: config.imagePath
      });
    });

    it('image is uploaded', async () => {
      const created = await svc.create({
        title: 'An online event with an image',
        description: 'Joyful dog',
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        timings: [{
          begin: '2020-12-22T11:35:00.000+0200',
          end: '2020-12-22T13:30:00.000+0200'
        }],
        image: fs.createReadStream('/tmp/dog.png')
      });

      await axios.head('https:' + config.imagePath + created.image.filename);
    });

    it(
      'validation error is thrown when unknown image format is provided',
      async () => {
        try {
          await svc.create({
            title: 'Event create given a text stream instead of image',
            description: 'Nope',
            attendanceMode: 2,
            onlineAccessLink: 'https://openagenda.com',
            timings: [{
              begin: '2020-12-22T11:35:00.000+0200',
              end: '2020-12-22T13:30:00.000+0200'
            }],
            image: fs.createReadStream('/tmp/notanimage.txt')
          });
        } catch (e) {
          assert(e instanceof ValidationError);
          return;
        }

        throw new Error('Should have failed.');
      }
    );

    it('image at null is no image at all', async () => {
      await svc.create({
        title: 'Event create given a text stream instead of image',
        description: 'Nope',
        image: null,
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        timings: [{
          begin: '2020-12-22T11:35:00.000+0200',
          end: '2020-12-22T13:30:00.000+0200'
        }]
      });
    });

    it('image can be passed as a non-encoded url (and as a encoded url)', async () => {
      const event = await svc.create({
        ...data,
        image: {
          url: 'https://lerize.villeurbanne.fr/wp-content/uploads/2023/01/230303_YaminaBenahmeddaho_©Francesca_Mantovani_editions_Gallimard-scaled.jpg',
        }
      });

      const response = await axios.head(`https:${config.imagePath}${event.image.filename}`);
      assert.equal(response.status, 200);
    });

    it('validation error is thrown when malformed url is provided for image', async () => {
      const error = await svc.create({
        ...data,
        image: { url: '%C4%97%' },
      }).then(() => {}, e => e);

      assert.equal(error.name, 'ValidationError');
    });

    it('validation error is thrown when invalid url is provided for image', async () => {
      let error;
      try {
        await svc.create({
          ...data,
          image: {
            url: 'https://s3.eu-central-1.amazonaws.com/oastatic/onda-185.png'
          }
        });
      } catch (e) {
        error = e;
      }
      assert(error instanceof ValidationError);
    });

    it(
      'image can be passed through a local file path, deleted after upload',
      done => {
        fs.copyFile(`${__dirname}/fixtures/images/dog.png`, TMP_IMG_PATH, async err => {
          const event = await svc.create({
            ...data,
            image: {
              path: TMP_IMG_PATH
            }
          });

          assert.equal(typeof event.image.filename, 'string');

          assert.equal(fs.existsSync(TMP_IMG_PATH), false);

          done();
        });
      }
    );

  });

  describe('timings', () => {

    it('using datehourminutes format', async () => {
      const event = await svc.create({
        title: 'Event with datehourminutes timing',
        description: 'Nope',
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        timings: [{
          begin: {
            date: '2020-10-21',
            hours: 20,
            minutes: 10
          },
          end: {
            date: '2020-10-21',
            hours: 21,
            minutes: 5
          }
        }]
      });

      assert.equal(event.timings[0].begin, '2020-10-21T20:10:00.000+02:00');
    });

    it('fix: DHM timing with hours value at 0 is valid', async () => {
      await svc.create({
        title: 'Event with datehourminutes timing',
        description: 'Nope',
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        timings: [{
          begin: {
            date: '2020-10-21',
            hours: 0,
            minutes: 0
          },
          end: {
            date: '2020-10-21',
            hours: 23,
            minutes: 59
          }
        }]
      });
    });

    it(
      'if timezone is unspecified but location object with timezone is provided, location timezone is used',
      async () => {
        const created = await svc.create({
          ...data,
          location: {
            ...data.location,
            timezone: 'America/Vancouver'
          }
        });

        assert.equal(created.timezone, 'America/Vancouver');
      }
    );

    it(
      'if timezone is specified, it is preferred over timezone present in location object',
      async () => {
        const created = await svc.create({
          ...data,
          timezone: 'Asia/Tokyo',
          location: {
            ...data.location,
            timezone: 'America/Vancouver'
          }
        });

        assert.equal(created.timezone, 'Asia/Tokyo');
      }
    );

    it('timings must have a duration', async () => {
      let error;
      try {
        await svc.create({
          title: 'Event create given a text stream instead of image',
          description: 'Nope',
          attendanceMode: 2,
          onlineAccessLink: 'https://openagenda.com',
          timings: [{
            begin: '2022-01-09T11:00:00.000+0200',
            end: '2022-01-09T11:00:00.000+0200'
          }],
        });
      } catch (e) {
        error = e;
      }

      assert(error instanceof ValidationError);
    });
  });

  describe('other', () => {
    it('create with private option results in private event', async () => {
      const event = await svc.create(data, { private: true });

      const isPrivate = await f.client('event_2')
        .first(['private'])
        .where('uid', event.uid)
        .then(r => r.private);

      assert.equal(isPrivate, true);
    });

    it('fileKey is defined at create', async () => {
      const event = await svc.create(data)

      const fileKey = await f.client('event_2')
        .first(['file_key'])
        .where('uid', event.uid)
        .then(r => r.file_key);

      assert.equal(fileKey.length, 32);
    });

    it('fileKey can be passed through options at create', async () => {
      const event = await svc.create(data, { fileKey: 'blaireau' });

      const fileKey = await f.client('event_2')
        .first(['file_key'])
        .where('uid', event.uid)
        .then(r => r.file_key);

      assert.equal(fileKey, 'blaireau');
    });

    it('draft create does not require all fields to be specified', async () => {
      try {
        const event = await svc.create({
          title: 'Un titre'
        }, { draft: true });
  
        assert.equal(typeof event.uid, 'number');
      } catch (e) {
        console.log(e);
      }
    });

    it('draft create does not required title to be specified', async () => {
      const event = await svc.create({
        description: 'Une description'
      }, { draft: true });

      assert.equal(event.title, undefined);
    });

    it('provided context is passed to interface call', done => {
      const onCreate = (createdEvent, context) => {
        assert.equal(context.agendaUid, 123);
        done();
      };

      const svc = Service({
        knex: f.client,
        interfaces: {
          onCreate
        }
      });

      svc.create(data, {
        context: {
          agendaUid: 123
        }
      });
    });

    it(
      'agendaUid is associated to created event when passed in context',
      async () => {
        const event = await svc.create(data, {
          context: {
            agendaUid: 123
          }
        });

        assert.equal(event.agendaUid, 123);
      }
    );

    it('location can be provided as object', async () => {
      const event = await svc.create({
        ...data,
        attendanceMode: 1,
        location: {
          uid: 123
        }
      });

      assert.equal(event.locationUid, 123);
    });

    it(
      'if userUid is provided in context, it is added as creatorUid and ownerUid of event',
      async () => {
        const event = await svc.create(data, {
          context: {
            userUid: 123
          },
          access: 'internal'
        });

        assert.equal(event.creatorUid, 123);
        assert.equal(event.ownerUid, 123);
      }
    );

    it('if an interface returns a promise, it will be waited upon', async () => {
      let calledOnCreate = false;

      const svc = Service({
        knex: f.client,
        interfaces: {
          onCreate: async (createdEvent, context) => {
            await new Promise(rs => setTimeout(rs, 10));
            calledOnCreate = true;
          }
        }
      });

      await svc.create(data);

      assert(calledOnCreate);

    });

  });

})
