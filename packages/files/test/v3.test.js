'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const isStream = require('is-stream');
const Files = require('../v3');
const testconfig = require('../testconfig');

const bucket = testconfig.s3.defaultBucket;
const filePath = path.join(__dirname, 'files/src3.png');

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

    stream.destroy();

    expect(result).toMatchObject({
      key: 'image',
      filename: 'src3_renamed.png',
      fileType: { ext: 'png', mime: 'image/png' },
      isImage: true,
      provider: 's3'
    });
    expect(isStream(result.stream)).toBe(true);
    expect(result.uploadValue).toMatchObject({
      Location: `https://${bucket}.s3.amazonaws.com/src3_renamed.png`,
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

    stream.destroy();

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
      Location: `https://${bucket}.s3.eu-west-1.amazonaws.com/une%20simple%20image_renamed.png`,
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

    stream.destroy();

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
      Location: `https://${bucket}.s3.eu-west-1.amazonaws.com/image-de-profil_small.png`,
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
      Location: `https://${bucket}.s3.eu-west-1.amazonaws.com/image-de-profil_large.png`,
      key: 'image-de-profil_large.png',
      Key: 'image-de-profil_large.png',
      Bucket: `${bucket}`
    });
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
        Location: `https://${bucket}.s3.eu-west-1.amazonaws.com/src3_renamed.png`,
        key: 'src3_renamed.png',
        Key: 'src3_renamed.png',
        Bucket: `${bucket}`
      });

      const uploadedImage = await axios.get(data.uploadValue.Location);

      expect(uploadedImage.headers['content-length']).toBe(stream.bytesRead.toString());
    });
  });
});
