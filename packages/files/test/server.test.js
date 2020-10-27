'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const finished = promisify(require('stream').finished);
const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const Files = require('../lib');
const testconfig = require('../testconfig');
const { s3UrlMatching } = require('./utils');

const bucket = testconfig.s3.defaultBucket;
const filePath = path.join(__dirname, 'files/src3.png');

describe('with server', () => {
  let service;
  let app;
  let server;
  let port;

  jest.setTimeout(30000);

  beforeAll(() => {
    service = Files(testconfig);
  });

  beforeEach(done => {
    app = express();
    server = app.listen(0, done);
  });

  beforeEach(() => {
    port = server.address().port;
  });

  afterEach(() => {
    server.close();
  });

  it('works with express and axios', async () => {
    const upload = service(
      {
        key: 'image',
        getFilename: (info, context) => `${path.parse(context.originalname).name}_renamed.png`
      }
    );

    const stream = fs.createReadStream(filePath);

    const checkMw = async (req, res) => {
      expect(req.body).toEqual({
        password: 'gnagnagna',
        text: 'Un champ!'
      });

      try {
        const result = await req.file.transformAndUpload();

        res.send(result);
      } catch (error) {
        console.log('error', error);
        res.status(400).send(error);
      }
    };

    app.use(upload.cleanup());
    app.use('/upload', upload.multer.single('image'), checkMw);
    app.use((err, req, res, next) => {
      console.log('Server error:', err);
      next(err);
    });

    const form = new FormData();
    form.append('image', stream);
    form.append('text', 'Un champ!');
    form.append('password', 'gnagnagna');

    const { data } = await axios.post(`http://localhost:${port}/upload`, form, { headers: form.getHeaders() });

    await finished(stream);

    expect(data).toMatchObject({
      key: 'image',
      filename: 'src3_renamed.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('src3_renamed.png'),
        key: 'src3_renamed.png',
        Key: 'src3_renamed.png',
        Bucket: `${bucket}`
      })
    });

    const uploadedImage = await axios.get(data.uploadValue.Location);

    expect(uploadedImage.headers['content-length']).toBe(stream.bytesRead.toString());

    await upload.providers.s3.remove('src3_renamed.png');
  });

  it('filter fake files', async () => {
    const upload = service(
      {
        key: 'image',
        getFilename: (info, context) => `${path.parse(context.originalname).name}_renamed.png`
      }
    );

    const checkMw = async (req, res) => {
      expect(req.body).toEqual({
        password: 'gnagnagna',
        pdf: [
          {
            url: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
          },
          { info: 'un truc' },
          { url: 'https://d.openagenda.com/images/openagenda.png' }
        ],
        truc: 42
      });

      res.send('ok');
    };

    app.use(upload.cleanup());
    app.use('/upload', upload.middleware([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 4 }]), checkMw);
    app.use((err, req, res, next) => {
      console.log('Server error:', err);
      next(err);
    });

    const form = new FormData();
    form.append('data', JSON.stringify({
      image: { path: '/etc/passwd' },
      pdf: [
        { url: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png' },
        { path: '/etc/passwd' },
        { path: '/etc/passwd', info: 'un truc' },
        { url: 'https://d.openagenda.com/images/openagenda.png' }
      ],
      truc: 42
    }));
    form.append('password', 'gnagnagna');

    const { data } = await axios.post(
      `http://localhost:${port}/upload`, form, { headers: form.getHeaders() }
    );

    expect(data).toBe('ok');
  });

  it('fails with multer limit', async () => {
    const upload = service(
      {
        key: 'image',
        getFilename: (info, context) => `${path.parse(context.originalname).name}_renamed.png`
      }
    );

    const stream = fs.createReadStream(filePath);

    const checkMw = async (req, res, next) => {
      expect(req.body).toEqual({
        password: 'gnagnagna',
        text: 'Un champ!'
      });

      try {
        const result = await req.image.transformAndUpload();

        res.send(result);
      } catch (error) {
        next(error);
      }
    };

    app.use(upload.cleanup());
    app.use('/upload', upload.multer.fields([{ name: 'image', maxCount: 1 }]), checkMw);
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      res.status(500).send(err);
    });

    const form = new FormData();
    form.append('image', stream);
    form.append('image', stream);
    form.append('text', 'Un champ!');
    form.append('password', 'gnagnagna');

    const { data } = await axios.post(
      `http://localhost:${port}/upload`,
      form,
      {
        headers: form.getHeaders(),
        validateStatus: status => status === 500
      }
    );

    await finished(stream);

    expect(data).toMatchObject({
      name: 'MulterError',
      message: 'Unexpected field',
      code: 'LIMIT_UNEXPECTED_FILE',
      field: 'image',
      storageErrors: []
    });
  });

  it('works with a maxCount > 1', async () => {
    let count = 0;
    const upload = service(
      {
        key: 'image',
        getFilename: (info, context) => {
          count += 1;
          return `${path.parse(context.originalname).name}-${count}.png`;
        }
      }
    );

    const stream = fs.createReadStream(filePath);

    const checkMw = async (req, res, next) => {
      expect(req.body).toEqual({
        password: 'gnagnagna',
        text: 'Un champ!'
      });

      try {
        const result = await Promise.all(
          req.files.image.map(image => image.transformAndUpload())
        );

        res.send(result);
      } catch (error) {
        next(error);
      }
    };

    app.use(upload.cleanup());
    app.use('/upload', upload.multer.fields([{ name: 'image', maxCount: 5 }]), checkMw);
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      console.log(err);
      res.status(500).send(err);
    });

    const form = new FormData();
    form.append('image', stream);
    form.append('image', stream);
    form.append('text', 'Un champ!');
    form.append('password', 'gnagnagna');

    const { data } = await axios.post(`http://localhost:${port}/upload`, form, { headers: form.getHeaders() });

    await finished(stream);

    expect(count).toBe(2);

    const [first, second] = data;

    expect(first).toMatchObject({
      key: 'image',
      filename: 'src3-1.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('src3-1.png'),
        key: 'src3-1.png',
        Key: 'src3-1.png',
        Bucket: `${bucket}`
      })
    });

    expect(second).toMatchObject({
      key: 'image',
      filename: 'src3-2.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('src3-2.png'),
        key: 'src3-2.png',
        Key: 'src3-2.png',
        Bucket: `${bucket}`
      })
    });

    const [firstImage, secondImage] = await Promise.all([
      axios.get(first.uploadValue.Location),
      axios.get(second.uploadValue.Location)
    ]);

    expect(firstImage.headers['content-length']).toBe(stream.bytesRead.toString());
    expect(secondImage.headers['content-length']).toBe(stream.bytesRead.toString());

    await Promise.all([
      upload.providers.s3.remove('src3-1.png'),
      upload.providers.s3.remove('src3-2.png')
    ]);
  });

  it('works with a programmatically call to upload (simple)', async () => {
    let count = 0;
    const upload = service({
      key: 'image',
      getFilename: (info, context) => {
        count += 1;
        return `${path.parse(context.originalname).name}-${count}.png`;
      }
    });

    const stream = fs.createReadStream(filePath);

    const checkMw = async (req, res, next) => {
      try {
        res.send({
          image: (await upload({
            image: req.files.image
          })).image,
          other: (await upload({
            image: [req.files.other, { uid: 42 }]
          })).image,
          foo: (await upload({
            image: req.files.foo.map((v, i) => [v, { uid: i }])
          })).image
        });
      } catch (error) {
        next(error);
      }
    };

    app.use(upload.cleanup());
    app.use('/upload', upload.middleware([
      { name: 'image', maxCount: 5 },
      { name: 'other', maxCount: 5 },
      { name: 'foo', maxCount: 5 }
    ]), checkMw);
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      console.log(err);
      res.status(500).send(err);
    });

    const form = new FormData();
    form.append('image', stream);
    form.append('image', stream);
    form.append('other', stream);
    form.append('other', stream);
    form.append('foo', stream);
    form.append('foo', stream);

    const { data } = await axios.post(`http://localhost:${port}/upload`, form, { headers: form.getHeaders() });

    await finished(stream);

    expect(count).toBe(6);

    const {
      image
    } = data;

    expect(image[0]).toMatchObject({
      key: 'image',
      filename: 'src3-1.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('src3-1.png'),
        key: 'src3-1.png',
        Key: 'src3-1.png',
        Bucket: `${bucket}`
      })
    });

    expect(image[1]).toMatchObject({
      key: 'image',
      filename: 'src3-2.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('src3-2.png'),
        key: 'src3-2.png',
        Key: 'src3-2.png',
        Bucket: `${bucket}`
      })
    });

    await Promise.all([
      upload.providers.s3.remove('src3-1.png'),
      upload.providers.s3.remove('src3-2.png'),
      upload.providers.s3.remove('src3-3.png'),
      upload.providers.s3.remove('src3-4.png'),
      upload.providers.s3.remove('src3-5.png'),
      upload.providers.s3.remove('src3-6.png')
    ]);
  });

  it('works with a programmatically call to upload (simple and not keyed)', async () => {
    let count = 0;
    const upload = service({
      key: 'image',
      getFilename: (info, context) => {
        count += 1;
        return `${path.parse(context.originalname).name}-${count}.png`;
      }
    });

    const stream = fs.createReadStream(filePath);

    const checkMw = async (req, res, next) => {
      try {
        res.send({
          image: await upload(req.files.image),
          other: await upload([req.files.other, { uid: 42 }]),
          foo: await upload(req.files.foo.map((v, i) => [v, { uid: i }]))
        });
      } catch (error) {
        next(error);
      }
    };

    app.use(upload.cleanup());
    app.use('/upload', upload.multer.fields([
      { name: 'image', maxCount: 5 },
      { name: 'other', maxCount: 5 },
      { name: 'foo', maxCount: 5 }
    ]), checkMw);
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      console.log(err);
      res.status(500).send(err);
    });

    const form = new FormData();
    form.append('image', stream);
    form.append('image', stream);
    form.append('other', stream);
    form.append('other', stream);
    form.append('foo', stream);
    form.append('foo', stream);

    const { data } = await axios.post(`http://localhost:${port}/upload`, form, { headers: form.getHeaders() });

    await finished(stream);

    expect(count).toBe(6);

    const {
      image
    } = data;

    expect(image[0]).toMatchObject({
      key: 'image',
      filename: 'src3-1.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('src3-1.png'),
        key: 'src3-1.png',
        Key: 'src3-1.png',
        Bucket: `${bucket}`
      })
    });

    expect(image[1]).toMatchObject({
      key: 'image',
      filename: 'src3-2.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('src3-2.png'),
        key: 'src3-2.png',
        Key: 'src3-2.png',
        Bucket: `${bucket}`
      })
    });

    await Promise.all([
      upload.providers.s3.remove('src3-1.png'),
      upload.providers.s3.remove('src3-2.png'),
      upload.providers.s3.remove('src3-3.png'),
      upload.providers.s3.remove('src3-4.png'),
      upload.providers.s3.remove('src3-5.png'),
      upload.providers.s3.remove('src3-6.png')
    ]);
  });

  it('works with a programmatically call to upload', async () => {
    let count = 0;
    const upload = service([
      {
        key: 'image',
        getFilename: (info, context) => {
          count += 1;
          return `${path.parse(context.originalname).name}-${count}.png`;
        }
      },
      {
        key: 'other',
        getFilename: (info, context) => {
          count += 1;
          return `${path.parse(context.originalname).name}-${count}.png`;
        }
      },
      {
        key: 'foo',
        getFilename: (info, context) => {
          count += 1;
          return `${path.parse(context.originalname).name}-${count}.png`;
        }
      }
    ]);

    const stream = fs.createReadStream(filePath);

    const checkMw = async (req, res, next) => {
      expect(req.body).toEqual({
        password: 'gnagnagna',
        text: 'Un champ!'
      });

      try {
        const result = await upload({
          image: req.files.image,
          other: [req.files.other, { uid: 42 }],
          foo: req.files.foo.map((v, i) => [v, { uid: i }])
        });

        res.send(result);
      } catch (error) {
        next(error);
      }
    };

    app.use(upload.cleanup());
    app.use('/upload', upload.multer.fields([
      { name: 'image', maxCount: 5 },
      { name: 'other', maxCount: 5 },
      { name: 'foo', maxCount: 5 }
    ]), checkMw);
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      console.log(err);
      res.status(500).send(err);
    });

    const form = new FormData();
    form.append('image', stream);
    form.append('image', stream);
    form.append('other', stream);
    form.append('other', stream);
    form.append('foo', stream);
    form.append('foo', stream);
    form.append('text', 'Un champ!');
    form.append('password', 'gnagnagna');

    const { data } = await axios.post(`http://localhost:${port}/upload`, form, { headers: form.getHeaders() });

    await finished(stream);

    expect(count).toBe(6);

    const {
      image,
      other,
      foo
    } = data;

    expect(image[0]).toMatchObject({
      key: 'image',
      filename: 'src3-1.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('src3-1.png'),
        key: 'src3-1.png',
        Key: 'src3-1.png',
        Bucket: `${bucket}`
      })
    });

    expect(other[0]).toMatchObject({
      key: 'other',
      filename: 'src3-3.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('src3-3.png'),
        key: 'src3-3.png',
        Key: 'src3-3.png',
        Bucket: `${bucket}`
      })
    });

    expect(foo[0]).toMatchObject({
      key: 'foo',
      filename: 'src3-5.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('src3-5.png'),
        key: 'src3-5.png',
        Key: 'src3-5.png',
        Bucket: `${bucket}`
      })
    });

    await Promise.all([
      upload.providers.s3.remove('src3-1.png'),
      upload.providers.s3.remove('src3-2.png'),
      upload.providers.s3.remove('src3-3.png'),
      upload.providers.s3.remove('src3-4.png'),
      upload.providers.s3.remove('src3-5.png'),
      upload.providers.s3.remove('src3-6.png')
    ]);
  });

  it('cleanup on response finish', async () => {
    let count = 0;
    const upload = service(
      {
        key: 'image',
        getFilename: (info, context) => {
          count += 1;
          return `${path.parse(context.originalname).name}-${count}.png`;
        }
      }
    );

    const stream = fs.createReadStream(filePath);

    const checkMw = (req, res, next) => {
      expect(req.body).toEqual({
        password: 'gnagnagna',
        text: 'Un champ!'
      });

      try {
        const paths = req.files.image.map(file => file.path);
        expect(paths).toHaveLength(2);

        res.on('finish', () => {
          paths.forEach(p => {
            expect(fs.existsSync(p)).toBe(false);
          });
        });

        res.sendStatus(200);
      } catch (error) {
        next(error);
      }
    };

    app.use(upload.cleanup());
    app.use('/upload', upload.multer.fields([{ name: 'image', maxCount: 5 }]), checkMw);
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      console.log(err);
      res.status(500).send(err);
    });

    const form = new FormData();
    form.append('image', stream);
    form.append('image', stream);
    form.append('text', 'Un champ!');
    form.append('password', 'gnagnagna');

    await axios.post(`http://localhost:${port}/upload`, form, { headers: form.getHeaders() });

    await finished(stream);

    expect(count).toBe(0);
  });
});
