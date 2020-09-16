'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const isStream = require('is-stream');
const Files = require('../v3');
const testconfig = require('../testconfig');

const gm = require('gm').subClass({
  imageMagick: true
});

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

    expect(result).toMatchObject({
      key: 'image',
      filename: 'src3_renamed.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3'
    });
    expect(isStream(result.stream)).toBe(true);
    expect(result.uploadValue).toMatchObject({
      Location: s3UrlMatching('src3_renamed.png'),
      key: 'src3_renamed.png',
      Key: 'src3_renamed.png',
      Bucket: `${bucket}`
    });
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

    const { simple } = result;

    expect(simple).toMatchObject({
      key: 'simple',
      filename: 'une simple image_renamed.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3'
    });
    expect(isStream(simple.stream)).toBe(true);
    expect(simple.uploadValue).toMatchObject({
      Location: s3UrlMatching('une%20simple%20image_renamed.png'),
      key: 'une simple image_renamed.png',
      Key: 'une simple image_renamed.png',
      Bucket: `${bucket}`
    });
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

    const { profileImage } = result;
    const [small, large] = profileImage;

    // small
    expect(small).toMatchObject({
      key: 'profileImage',
      filename: 'image-de-profil_small.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3'
    });
    expect(isStream(small.stream)).toBe(true);
    expect(small.uploadValue).toMatchObject({
      Location: s3UrlMatching('image-de-profil_small.png'),
      key: 'image-de-profil_small.png',
      Key: 'image-de-profil_small.png',
      Bucket: `${bucket}`
    });

    // large
    expect(large).toMatchObject({
      key: 'profileImage',
      filename: 'image-de-profil_large.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3'
    });
    expect(isStream(large.stream)).toBe(true);
    expect(large.uploadValue).toMatchObject({
      Location: s3UrlMatching('image-de-profil_large.png'),
      key: 'image-de-profil_large.png',
      Key: 'image-de-profil_large.png',
      Bucket: `${bucket}`
    });

    // Check image sizes
    const smallImage = await axios.get(small.uploadValue.Location);
    expect(smallImage.headers['content-length']).toBe(stream.bytesRead.toString());

    const largeImage = await axios.get(large.uploadValue.Location);
    expect(largeImage.headers['content-length']).toBe(stream.bytesRead.toString());
  });

  describe('with server', () => {
    let app;
    let server;
    let port;

    beforeAll(() => {
      app = express();
      server = app.listen(0);
      port = server.address().port;
    });

    afterAll(() => {
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

      expect(data).toMatchObject({
        key: 'image',
        filename: 'src3_renamed.png',
        fileType: { ext: 'png', mime: 'image/png' },
        isImage: true,
        provider: 's3'
      });
      expect(data.uploadValue).toMatchObject({
        Location: s3UrlMatching('src3_renamed.png'),
        key: 'src3_renamed.png',
        Key: 'src3_renamed.png',
        Bucket: `${bucket}`
      });

      const uploadedImage = await axios.get(data.uploadValue.Location);

      expect(uploadedImage.headers['content-length']).toBe(stream.bytesRead.toString());
    });
  });

  describe('transform images with gm', () => {
    it('works with a webp image', async () => {
      const upload = service({
        key: 'image',
        getFilename: (
          info,
          context
        ) => `${path.parse(context.originalname).name}_renamed${path.parse(context.originalname).ext}`,
        transform: async (info, context) => {
          const image = gm(info.stream, context.originalname);

          const size = await promisify(image.size).call(image, { bufferStream: true });

          image.resize(size.width / 2, size.height / 2);

          return image
            .resize(size.width / 2, size.height / 2)
            .stream('jpg');
        }
      });

      const stream = fs.createReadStream(path.join(__dirname, 'files/josep_aff.jpg'));

      const result = await upload(stream);

      expect(result).toMatchObject({
        key: 'image',
        filename: 'josep_aff_renamed.jpg',
        fileType: { ext: 'webp', mime: 'image/webp' },
        isImage: true,
        provider: 's3'
      });
      expect(isStream(result.stream)).toBe(true);
      expect(result.uploadValue).toMatchObject({
        Location: s3UrlMatching('josep_aff_renamed.jpg'),
        key: 'josep_aff_renamed.jpg',
        Key: 'josep_aff_renamed.jpg',
        Bucket: `${bucket}`
      });
    });

    it('fails', async () => {
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

      // Images removed
      await expect(axios.get('https://oadev.s3.amazonaws.com/src3.png'))
        .rejects.toThrow('Request failed with status code 404');
      await expect(axios.get('https://oadev.s3.amazonaws.com/josep_aff.jpg'))
        .rejects.toThrow('Request failed with status code 404');
    });
  });
});
