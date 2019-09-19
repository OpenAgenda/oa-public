'use strict';

// const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const tmp = require('tmp');
const knexLib = require('knex');
const feathers = require('@feathersjs/feathers');
const fixtures = require('@openagenda/fixtures');
const keysSvc = require('@openagenda/keys/test/service');
const keysConfig = require('@openagenda/keys/service/config');
const imageFiles = require('@openagenda/image-files');
const images = require('@openagenda/images');
const files = require('@openagenda/files');
const Service = require('../');
const crypto = require('../utils/crypto');
const config = require('../testconfig');

const { hooks } = Service;

const database = `${config.mysql.database}_service`;
let knex;

const getConfig = options => ({
  Model: knex,
  name: config.schemas.user,
  paginate: config.paginate,
  multi: true,
  interfaces: config.interfaces,
  imagePath: config.imagePath,
  files: config.files,
  schemas: config.schemas,
  ...options
});

const kaoreUid = 75052324;

// function copySync(src, dest) {
//   if (!fs.existsSync(src)) {
//     return false;
//   }
//
//   const data = fs.readFileSync(src, 'utf-8');
//   fs.writeFileSync(dest, data);
// }

beforeEach(async () => {
  knex = knexLib({
    client: 'mysql',
    connection: { ...config.mysql, database },
    schemas: config.schemas
  });

  await keysSvc.initAndLoad(
    {
      ...config,
      mysql: { ...config.mysql, database },
      migrations: {
        directory: path.join(__dirname, '../../keys/migrations'),
        tableName: 'knex_migrations_keys'
      }
    },
    []
  );

  // await knex.raw( `CREATE DATABASE IF NOT EXISTS \`${database}\`;` );
  // await knex.raw( `USE \`${database}\`;` );
  // knex.client.config.connection.database = database;

  fixtures.init({ mysql: { ...config.mysql, database } });
  files.init(config.files);
  images.init({ tmpPath: config.files.tmpPath });
  imageFiles.init({ images, files });

  await knex.migrate.latest({
    directory: path.join(__dirname, '../migrations')
  });
  await knex.seed.run({ directory: path.join(__dirname, '../seeds/dev') });
});

afterEach(async () => {
  await knex.raw(`DROP DATABASE IF EXISTS \`${database}\`;`);
  await keysConfig.knex.destroy();
  await knex.destroy();
});

afterAll(() => tmp.setGracefulCleanup());

describe('Service', () => {
  it('instanciate', () => {
    const service = new Service(getConfig());

    expect(service).toBeInstanceOf(Service);
  });

  it('in app', async () => {
    const app = feathers();

    app.use('/', new Service(getConfig()));

    const service = app.service('/');

    expect(service.get).toBeInstanceOf(Function);
  });
});

describe('methods', () => {
  let app;
  let service;

  beforeEach(async () => {
    app = feathers();

    app.use('/', new Service(getConfig()));

    service = app.service('/');

    service.hooks(hooks);

    app.setup();
  });

  describe('get', () => {
    it('simple get', async () => {
      const user = await service.get(kaoreUid);

      expect(user.fullName).toBe('Kari Olafsson');
      expect(user).toHaveProperty('hasSocialAccount');
      expect(user).toHaveProperty('hasLocalAccount');
      expect(user).not.toHaveProperty('isRemoved');
      expect(user).not.toHaveProperty('isActivated');
    });

    it('get inexistent user', async () => {
      const user = await service.get(86861664);

      expect(user).toBeNull();
    });

    it('get user with detailed option', async () => {
      const user = await service.get(kaoreUid, { detailed: true });

      expect(user).toHaveProperty('isRemoved');
      expect(user).toHaveProperty('isActivated');
    });

    it('get user with internal option', async () => {
      const user = await service.get(kaoreUid, { internal: true });

      expect(user).toHaveProperty('replyToken');
    });

    it('get user with removed option at null', async () => {
      const user = await service.get(9003991, { removed: null });

      expect(user.email).toBe('contact@dedale.info');
      expect(user).not.toHaveProperty('isRemoved');
      expect(user).not.toHaveProperty('isActivated');
    });

    it('get user with includeImagePath', async () => {
      const user = await service.get(75052324, { includeImagePath: true });

      expect(user.image).toBe(
        '//openagendatst.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      );
      expect(user.email).toBe('kaoreolafsson@gmail.com');
    });

    it('returns apiKey and secretKey', async () => {
      const user = await service.get(99999999, { provider: 'rest' });

      expect(user.apiKey).toBe('317e316466a629c8dacd4aa81f39c930');
      expect(user.apiSecret).toBeNull();
    });
  });

  describe('find', () => {
    it('find with a search query', async () => {
      const { total, data: users } = await service.find({
        query: {
          $search: 'latouche'
        }
      });

      expect(total).toBe(1);
      expect(users[0]).toMatchObject({
        fullName: 'Gaetan Latouche'
      });
    });

    it('find with uid query', async () => {
      const { total, data: users } = await service.find({
        query: {
          uid: {
            $in: [54505079, 27639980]
          }
        }
      });

      expect(total).toBe(2);
      expect(users.map(v => v.uid)).toEqual(
        expect.arrayContaining([27639980, 54505079])
      );
    });

    it('find with detailed param', async () => {
      const { data: users } = await service.find({
        query: {
          $search: 'latouche'
        },
        detailed: true
      });

      expect(users[0]).toHaveProperty('isRemoved');
      expect(users[0]).toHaveProperty('isActivated');
    });

    it('find with removed param at true', async () => {
      const { total, data: users } = await service.find({
        removed: true,
        detailed: true
      });

      expect(total).toBe(1);
      expect(users[0]).toMatchObject({
        isRemoved: true
      });
    });

    it('find with removed param at false', async () => {
      const { total, data: users } = await service.find({
        removed: false,
        detailed: true
      });

      expect(total).toBe(25);
      expect(users[0]).toMatchObject({
        isRemoved: false
      });
    });

    it('find with removed param at null', async () => {
      const { total } = await service.find({
        removed: null,
        detailed: true
      });

      expect(total).toBe(26);
    });
  });

  describe('findOne', () => {
    it('findOne by email', async () => {
      const email = 'romain.lange@gmail.com';

      const user = await service.findOne({
        query: {
          email
        }
      });

      expect(user.email).toBe(email);
    });

    it('findOne by key', async () => {
      const key = '317e316466a629c8dacd4aa81f39c930';

      const user = await service.findOne({
        query: {
          key
        }
      });

      expect(user.apiKey).toBe(key);
    });
  });

  // describe('setImageProfile', () => {
  //   it('setImageProfile with a path', async () => {
  //     const tmpFile = tmp.fileSync({ postfix: '.jpg' });
  //
  //     fs.createReadStream(path.join(__dirname, 'files/phteven.jpg'))
  //       .pipe(fs.createWriteStream(tmpFile.name));
  //
  //     copySync(path.resolve(__dirname, 'files/googlelogo_color_272x92dp.png'), tmpFile.name);
  //
  //     const result = await service.setImageProfile(kaoreUid, {
  //       path: tmpFile.name
  //     });
  //
  //     expect(result.uploadedPaths).toHaveLength(3);
  //     expect(result.uploadedPaths[0]).toContain('user.profile.75052324');
  //   });
  // });
  //
  // describe('clearImageProfile', () => {
  //   it('clear image profile of a user', async () => {
  //     await service.clearImageProfile(kaoreUid);
  //
  //     const user = await service.get(kaoreUid);
  //
  //     expect(user.image).toBeNull();
  //   });
  // });

  describe('create', () => {
    it('create a user with an already taken email', async () => {
      await expect(
        service.create({
          fullName: 'Jean-Eude',
          email: 'gaetan@cibul.net',
          password: 'pa**word'
        })
      ).rejects.toThrow('Already exist');
    });

    it('create an activated user', async () => {
      const user = await service.create(
        {
          fullName: 'Jean-Eude',
          email: 'jean-eude@oa.com',
          password: 'pa**word',
          isActivated: true
        },
        { detailed: true }
      );

      expect(user.isActivated).toBe(true);
      expect(user.apiKey).toBeTruthy();
    });

    it('create a user should hash password', async () => {
      const password = 'pa**word';

      const user = await service.create(
        { fullName: 'Jean-Eude', email: 'jean-eude@oa.com', password },
        { detailed: true, internal: true }
      );

      expect(user.password).not.toBe(password);
    });

    it('create a user and an activation token', async () => {
      const email = 'jean-eude@oa.com';
      const user = await service.create(
        { fullName: 'Jean-Eude', email, password: 'pa**word' },
        { detailed: true }
      );

      const token = await service.tokens.findOne({ query: { email } });
      expect(user.email).toBe(email);
      expect(token.token).toHaveLength(32);
    });

    it("doesn't create an activation token for an activated user", async () => {
      const email = 'jean-eude@oa.com';
      const user = await service.create(
        {
          fullName: 'Jean-Eude',
          email,
          password: 'pa**word',
          isActivated: true
        },
        { detailed: true }
      );

      const token = await service.tokens.findOne({ query: { email } });
      expect(user.email).toBe(email);
      expect(token).toBeUndefined();
    });

    it('create generate a reply token', async () => {
      const email = 'jean-eude@oa.com';
      const user = await service.create(
        {
          fullName: 'Jean-Eude',
          email,
          password: 'pa**word',
          isActivated: true
        },
        { detailed: true, internal: true }
      );

      expect(typeof user.replyToken).toBe('string');
      expect(user.replyToken).toHaveLength(36);
    });
  });

  describe('patch', () => {
    it('patch language of a user', async () => {
      const result = await service.patch(kaoreUid, { culture: 'is' });

      expect(result.culture).toBe('is');
    });

    it('patch user with a too long language', async () => {
      await expect(
        service.patch(kaoreUid, { culture: 'francaisDeFrânce' })
      ).rejects.toMatchObject({
        errors: [
          {
            field: 'culture',
            code: 'string.toolong'
          }
        ]
      });
    });

    it('activating a user creates its token', async () => {
      // just check if interfaces.onActivation is called
      const user = await service.patch(
        38157927,
        { isActivated: true },
        { internal: true }
      );

      await expect(user.isActivated).toBe(true);
      await expect(user.apiKey).toBeTruthy();
    });
  });

  describe('remove', () => {
    it('remove a user', async () => {
      await service.remove(17133001, { removed: null, detailed: true });

      const modifiedUser = await service.get(17133001);

      expect(modifiedUser).toBeNull();

      const removedUser = await service.get(17133001, {
        removed: null,
        detailed: true,
        internal: true
      });

      expect(removedUser.email).toBeNull();
      expect(removedUser.store.email).toBe('vincentac@gmail.com');
      expect(removedUser.isRemoved).toBe(true);
    });
  });

  describe('requestChangeEmail', () => {
    it('basic requestChangeEmail', async () => {
      await service.requestChangeEmail(kaoreUid, {
        newEmail: 'jean-meaurice@hotmail.fr'
      });

      const internalUser = await service.get(kaoreUid, { internal: true });

      expect(internalUser.store.newEmail).toBe('jean-meaurice@hotmail.fr');
      expect(internalUser.store.newEmailToken).toHaveLength(32);
    });

    it('attempt to requestChangeEmail with an already taken email', async () => {
      await expect(
        service.requestChangeEmail(kaoreUid, {
          newEmail: 'romain.lange@gmail.com'
        })
      ).rejects.toThrow('Already exist');
    });

    it('attempt to requestChangeEmail with a bad email', async () => {
      await expect(
        service.requestChangeEmail(kaoreUid, {
          newEmail: 'romain.langegmail.com'
        })
      ).rejects.toMatchObject({
        errors: [
          {
            field: 'newEmail',
            code: 'email.invalid'
          }
        ]
      });
    });
  });

  describe('confirmChangeEmail', () => {
    it('basic confirmChangeEmail', async () => {
      const user = await service.confirmChangeEmail(kaoreUid, {
        query: {
          token: 'e4a0f1c97b2f4ca7966f069e7b090c0d'
        }
      });

      const internalUser = await service.get(kaoreUid, { internal: true });

      expect(user.email).toBe('jean-bernard@gmail.com');
      expect(internalUser.store.newEmail).toBeUndefined();
      expect(internalUser.store.newEmailToken).toBeUndefined();
    });

    it('attempt to change his email for an email taken in the meantime', async () => {
      await expect(
        service.confirmChangeEmail(17133001, {
          query: {
            token: '87071649646742ee8dce48e4eb1dc0b0'
          }
        })
      ).rejects.toThrow('Already exist');
    });

    it('attempt to change email with a bad token in the query', async () => {
      await expect(
        service.confirmChangeEmail(17133001, {
          query: {
            token: '87071649646742ee8dce48e4eb1dccbd'
          }
        })
      ).rejects.toThrow('Bad token');
    });
  });

  describe('changePassword', () => {
    it('change password', async () => {
      const password = 'lab***adudule';

      await service.changePassword(17133001, {
        password
      });

      const result = await knex(config.schemas.user)
        .select()
        .first()
        .where({ uid: 17133001 });

      expect(result.password).toBe(crypto.hashPassword(password, result.salt));
    });

    it('change password - validation fail', async () => {
      await expect(
        service.changePassword(17133001, {
          password: null
        })
      ).rejects.toMatchObject({
        errors: [
          {
            field: 'password',
            code: 'required'
          }
        ]
      });
    });

    it('try to change password of an inexistent user', async () => {
      const password = 'lab***adudule';

      const result = await service.changePassword(78945612, {
        password
      });

      expect(result).toBeNull();
    });
  });

  describe('generateApiKey', () => {
    it('generate new api public key', async () => {
      const user = await service.generateApiKey(17133001, {
        publicKey: true,
        secretKey: true
      });

      expect(user.apiSecret).toBeTruthy();
    });
  });

  describe('setNewFlag', () => {
    it('set a new flag to true', async () => {
      const user = await service.get(17133001);

      expect(user.isNew).toBe(true);

      const modifiedUser = await service.setNewFlag(17133001, { isNew: false });

      expect(modifiedUser.isNew).toBe(false);
    });
  });

  describe('refresh', () => {
    const now = new Date(Math.round(Date.now() / 1000) * 1000);
    let clock;

    beforeAll(() => {
      clock = sinon.useFakeTimers({ now });
    });

    afterAll(() => {
      clock.restore();
    });

    it('refresh lastSignin', async () => {
      const user = await service.refresh(
        17133001,
        {
          lastSignin: true
        },
        {
          detailed: true
        }
      );

      expect(user.lastSignin).toStrictEqual(now);
    });

    it('refresh lastInboxCheck', async () => {
      const user = await service.refresh(
        17133001,
        {
          lastInboxCheck: true
        },
        {
          detailed: true
        }
      );

      expect(user.lastInboxCheck).toStrictEqual(now);
    });

    it('refresh lastNotified', async () => {
      const user = await service.refresh(
        17133001,
        {
          lastNotified: true
        },
        {
          detailed: true
        }
      );

      expect(user.lastNotified).toStrictEqual(now);
    });
  });

  describe('verifyPassword', () => {
    it('check a good password', async () => {
      const validPassword = await service.verifyPassword('cibulon', {
        query: {
          email: 'gaetan@cibul.net'
        }
      });

      expect(validPassword).toBe(true);
    });
  });
});
