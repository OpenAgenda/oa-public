'use strict';

const fs = require('fs');
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');
const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const isStream = require('is-stream');
const Files = require('../v3');
const testconfig = require('../testconfig');

const finished = promisify(stream.finished);

const bucket = testconfig.s3.defaultBucket;
const filePath = path.join(__dirname, 'files/src3.png');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const s3UrlRegexStr = '(s3-|s3\\.)?(.*)\\.amazonaws\\.com';
const s3UrlRegex = new RegExp(s3UrlRegexStr);

function s3UrlMatching(filename) {
  return expect.stringMatching(new RegExp(`${s3UrlRegexStr}${escapeRegExp(`/${filename}`)}`));
}

describe('v3', () => {
  let service;

  jest.setTimeout(30000);

  beforeAll(() => {
    service = Files(testconfig);
  });

  it('can upload a stream', async () => {
    const upload = service({
      key: 'image',
      getFilename: (
        info,
        context
      ) => `${path.parse(context.originalname).name}_renamed${path.parse(context.originalname).ext}`
    });

    const stream = fs.createReadStream(filePath);

    const result = await upload(stream);

    await finished(stream);

    expect(result).toMatchObject({
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
    expect(isStream(result.stream)).toBe(true);

    await upload.providers.s3.remove('src3_renamed.png');
  });

  it('can upload multiple stream', async () => {
    const upload = service([
      {
        key: 'simple',
        getFilename: (
          info,
          context
        ) => `${path.parse(context.originalname).name}_renamed${path.parse(context.originalname).ext}`
      }
    ]);

    const stream = fs.createReadStream(filePath);

    const result = await upload({
      simple: [stream, { originalname: 'une simple image.png' }]
    }, { sharedContext: 42 });

    await finished(stream);

    const { simple } = result;

    expect(simple).toMatchObject({
      key: 'simple',
      filename: 'une simple image_renamed.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('une%20simple%20image_renamed.png'),
        key: 'une simple image_renamed.png',
        Key: 'une simple image_renamed.png',
        Bucket: `${bucket}`
      })
    });
    expect(isStream(simple.stream)).toBe(true);

    await upload.providers.s3.remove('une simple image_renamed.png');
  });

  it('can upload multiple stream for multiple output', async () => {
    const upload = service([
      {
        key: 'profileImage',
        variants: [
          {
            getFilename: (
              info,
              context
            ) => `${path.parse(context.originalname).name}_small${path.parse(context.originalname).ext}`
          }, {
            getFilename: (
              info,
              context
            ) => `${path.parse(context.originalname).name}_large${path.parse(context.originalname).ext}`
          }
        ]
      }
    ]);

    const stream = fs.createReadStream(filePath);

    const result = await upload({
      profileImage: [stream, { originalname: 'image-de-profil.png' }]
    }, { sharedContext: 42 });

    await finished(stream);

    const { profileImage } = result;
    const [small, large] = profileImage;

    // small
    expect(small).toMatchObject({
      key: 'profileImage',
      filename: 'image-de-profil_small.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('image-de-profil_small.png'),
        key: 'image-de-profil_small.png',
        Key: 'image-de-profil_small.png',
        Bucket: `${bucket}`
      })
    });
    expect(isStream(small.stream)).toBe(true);

    // large
    expect(large).toMatchObject({
      key: 'profileImage',
      filename: 'image-de-profil_large.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3',
      uploadValue: expect.objectContaining({
        Location: s3UrlMatching('image-de-profil_large.png'),
        key: 'image-de-profil_large.png',
        Key: 'image-de-profil_large.png',
        Bucket: `${bucket}`
      })
    });
    expect(isStream(large.stream)).toBe(true);

    // Check image sizes
    const smallImage = await axios.get(small.uploadValue.Location);
    expect(smallImage.headers['content-length']).toBe(stream.bytesRead.toString());

    const largeImage = await axios.get(large.uploadValue.Location);
    expect(largeImage.headers['content-length']).toBe(stream.bytesRead.toString());

    await Promise.all([
      upload.providers.s3.remove('image-de-profil_small.png'),
      upload.providers.s3.remove('image-de-profil_large.png')
    ]);
  });

  describe('with server', () => {
    let app;
    let server;
    let port;

    beforeEach(() => {
      app = express();
      server = app.listen(0);
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

      const checkMw = (req, res) => {
        expect(req.body).toEqual({
          password: 'gnagnagna',
          text: 'Un champ!'
        });

        req.file.transformAndUpload()
          .then(result => res.send(result))
          .catch(error => {
            console.log('error', error);
            res.status(400).send(error);
          });
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

          res.send(result)
        } catch (error) {
          next(error);
        }
      };

      app.use(upload.cleanup());
      app.use('/upload', upload.multer.fields([{ name: 'image', maxCount: 1 }]), checkMw);
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
          getFilename: (info, context) => `${path.parse(context.originalname).name}-${count++}.png`
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

          res.send(result)
        } catch (error) {
          next(error);
        }
      };

      app.use(upload.cleanup());
      app.use('/upload', upload.multer.fields([{ name: 'image', maxCount: 5 }]), checkMw);
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
        filename: 'src3-0.png',
        fileType: { ext: 'png', mime: 'image/png' },
        isImage: true,
        provider: 's3',
        uploadValue: expect.objectContaining({
          Location: s3UrlMatching('src3-0.png'),
          key: 'src3-0.png',
          Key: 'src3-0.png',
          Bucket: `${bucket}`
        })
      });

      expect(second).toMatchObject({
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

      const [firstImage, secondImage] = await Promise.all([
        axios.get(first.uploadValue.Location),
        axios.get(second.uploadValue.Location)
      ]);

      expect(firstImage.headers['content-length']).toBe(stream.bytesRead.toString());
      expect(secondImage.headers['content-length']).toBe(stream.bytesRead.toString());

      await Promise.all([
        upload.providers.s3.remove('src3-0.png'),
        upload.providers.s3.remove('src3-1.png')
      ]);
    });

    it('works with a programmatically call to upload (simple)', async () => {
      let count = 0;
      const upload = service({
        key: 'image',
        getFilename: (info, context) => `${path.parse(context.originalname).name}-${count++}.png`
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
      app.use('/upload', upload.multer.fields([
        { name: 'image', maxCount: 5 },
        { name: 'other', maxCount: 5 },
        { name: 'foo', maxCount: 5 }
        ]), checkMw);
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

      console.log(data);

      expect(image[0]).toMatchObject({
        key: 'image',
        filename: 'src3-0.png',
        fileType: { ext: 'png', mime: 'image/png' },
        isImage: true,
        provider: 's3',
        uploadValue: expect.objectContaining({
          Location: s3UrlMatching('src3-0.png'),
          key: 'src3-0.png',
          Key: 'src3-0.png',
          Bucket: `${bucket}`
        })
      });

      expect(image[1]).toMatchObject({
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

      await Promise.all([
        upload.providers.s3.remove('src3-0.png'),
        upload.providers.s3.remove('src3-1.png'),
        upload.providers.s3.remove('src3-2.png'),
        upload.providers.s3.remove('src3-3.png'),
        upload.providers.s3.remove('src3-4.png'),
        upload.providers.s3.remove('src3-5.png')
      ]);
    });

    it('works with a programmatically call to upload (simple and not keyed)', async () => {
      let count = 0;
      const upload = service({
        key: 'image',
        getFilename: (info, context) => `${path.parse(context.originalname).name}-${count++}.png`
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
        filename: 'src3-0.png',
        fileType: { ext: 'png', mime: 'image/png' },
        isImage: true,
        provider: 's3',
        uploadValue: expect.objectContaining({
          Location: s3UrlMatching('src3-0.png'),
          key: 'src3-0.png',
          Key: 'src3-0.png',
          Bucket: `${bucket}`
        })
      });

      expect(image[1]).toMatchObject({
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

      await Promise.all([
        upload.providers.s3.remove('src3-0.png'),
        upload.providers.s3.remove('src3-1.png'),
        upload.providers.s3.remove('src3-2.png'),
        upload.providers.s3.remove('src3-3.png'),
        upload.providers.s3.remove('src3-4.png'),
        upload.providers.s3.remove('src3-5.png')
      ]);
    });

    it('works with a programmatically call to upload', async () => {
      let count = 0;
      const upload = service([
        {
          key: 'image',
          getFilename: (info, context) => `${path.parse(context.originalname).name}-${count++}.png`
        },
        {
          key: 'other',
          getFilename: (info, context) => `${path.parse(context.originalname).name}-${count++}.png`
        },
        {
          key: 'foo',
          getFilename: (info, context) => `${path.parse(context.originalname).name}-${count++}.png`
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

          res.send(result)
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
        filename: 'src3-0.png',
        fileType: { ext: 'png', mime: 'image/png' },
        isImage: true,
        provider: 's3',
        uploadValue: expect.objectContaining({
          Location: s3UrlMatching('src3-0.png'),
          key: 'src3-0.png',
          Key: 'src3-0.png',
          Bucket: `${bucket}`
        })
      });

      expect(other[0]).toMatchObject({
        key: 'other',
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

      expect(foo[0]).toMatchObject({
        key: 'foo',
        filename: 'src3-4.png',
        fileType: { ext: 'png', mime: 'image/png' },
        isImage: true,
        provider: 's3',
        uploadValue: expect.objectContaining({
          Location: s3UrlMatching('src3-4.png'),
          key: 'src3-4.png',
          Key: 'src3-4.png',
          Bucket: `${bucket}`
        })
      });

      await Promise.all([
        upload.providers.s3.remove('src3-0.png'),
        upload.providers.s3.remove('src3-1.png'),
        upload.providers.s3.remove('src3-2.png'),
        upload.providers.s3.remove('src3-3.png'),
        upload.providers.s3.remove('src3-4.png'),
        upload.providers.s3.remove('src3-5.png')
      ]);
    });

    it('cleanup on response finish', async () => {
      let count = 0;
      const upload = service(
        {
          key: 'image',
          getFilename: (info, context) => `${path.parse(context.originalname).name}-${count++}.png`
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

  describe('transform', () => {
    it('works with a webp image', async () => {
      const upload = service({
        key: 'image',
        getFilename: (
          info,
          context
        ) => `${path.parse(context.originalname).name}_renamed${path.parse(context.originalname).ext}`,
        transform: async (info, context) => {
          const image = service.gm(info.stream, context.originalname);

          const size = await promisify(image.size).call(image, { bufferStream: true });

          image.resize(size.width / 2, size.height / 2);

          return image
            .resize(size.width / 2, size.height / 2)
            .stream('jpg');
        }
      });

      const stream = fs.createReadStream(path.join(__dirname, 'files/josep_aff.jpg'));

      const result = await upload(stream);

      await finished(stream);

      expect(result).toMatchObject({
        key: 'image',
        filename: 'josep_aff_renamed.jpg',
        fileType: { ext: 'webp', mime: 'image/webp' },
        isImage: true,
        provider: 's3',
        uploadValue: expect.objectContaining({
          Location: s3UrlMatching('josep_aff_renamed.jpg'),
          key: 'josep_aff_renamed.jpg',
          Key: 'josep_aff_renamed.jpg',
          Bucket: `${bucket}`
        })
      });
      expect(isStream(result.stream)).toBe(true);

      await upload.providers.s3.remove('josep_aff_renamed.jpg');
    });

    it('abort all uploads on failure', async () => {
      const upload = service([
        {
          key: 'image',
          getFilename: (
            info,
            context
          ) => `${path.parse(context.originalname).name}_renamed${path.parse(context.originalname).ext}`
        },
        {
          key: 'buggy',
          variants: [
            {
              getFilename: (
                info,
                context
              ) => `${path.parse(context.originalname).name}_work${path.parse(context.originalname).ext}`
            },
            {
              getFilename: (
                info,
                context
              ) => `${path.parse(context.originalname).name}_fail${path.parse(context.originalname).ext}`,
              transform: () => {
                throw new Error('Ca ne marche pas !');
              }
            }
          ]
        }
      ]);

      const stream1 = fs.createReadStream(path.join(__dirname, 'files/src3.png'));
      const stream2 = fs.createReadStream(path.join(__dirname, 'files/josep_aff.jpg'));

      await expect(upload({
        image: stream1,
        buggy: stream2
      })).rejects.toThrow('Ca ne marche pas !');

      await finished(stream1);
      await finished(stream2);

      // Images removed
      await expect(axios.get(`https://${bucket}.s3.amazonaws.com/src3_renamed.png`))
        .rejects.toThrow('Request failed with status code 404');
      await expect(axios.get(`https://${bucket}.s3.amazonaws.com/josep_aff_work.jpg`))
        .rejects.toThrow('Request failed with status code 404');
      await expect(axios.get(`https://${bucket}.s3.amazonaws.com/josep_aff_fail.jpg`))
        .rejects.toThrow('Request failed with status code 404');

      await Promise.all([
        upload.providers.s3.remove('src3_renamed.png'),
        upload.providers.s3.remove('josep_aff_work.jpg'),
        upload.providers.s3.remove('josep_aff_fail.jpg')
      ]);
    });

    it('set content type', async () => {
      const upload = service({
        key: 'image',
        variants: [
          {
            getFilename: (
              info,
              context
            ) => `${path.parse(context.originalname).name}_detected${path.parse(context.originalname).ext}`
          },
          {
            getFilename: (
              info,
              context
            ) => `${path.parse(context.originalname).name}_binary${path.parse(context.originalname).ext}`,
            transform: info => info.stream
          },
          {
            getFilename: (
              info,
              context
            ) => `${path.parse(context.originalname).name}_image${path.parse(context.originalname).ext}`,
            transform: (info, context) => {
              context.providerParams.ContentType = 'image/png';

              return info.stream;
            }
          }
        ]
      });

      const stream = fs.createReadStream(path.join(__dirname, 'files/src3.png'));

      const result = await upload({
        image: stream
      });

      const [detected, binary, image] = result.image;

      await finished(stream);

      const imagesFromS3 = await Promise.all([
        axios.get(detected.uploadValue.Location),
        axios.get(binary.uploadValue.Location),
        axios.get(image.uploadValue.Location)
      ]);

      const headers = imagesFromS3.map(v => v.headers['content-type']);

      expect(headers).toEqual([
        'image/png',
        'application/octet-stream',
        'image/png'
      ]);

      await Promise.all([
        upload.providers.s3.remove('src3_detected.png'),
        upload.providers.s3.remove('src3_binary.png'),
        upload.providers.s3.remove('src3_image.png')
      ]);
    });
  });
});
