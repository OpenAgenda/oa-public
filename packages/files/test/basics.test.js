'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const finished = promisify(require('stream').finished);
const axios = require('axios');
const isStream = require('is-stream');
const Files = require('../lib');
const testconfig = require('../testconfig');
const { s3UrlMatching } = require('./utils');


const bucket = testconfig.s3.defaultBucket;
const filePath = path.join(__dirname, 'files/src3.png');

describe('basics', () => {
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
    const upload = service({
      key: 'simple',
      getFilename: (
        info,
        context
      ) => `${path.parse(context.originalname).name}_renamed${path.parse(context.originalname).ext}`
    });

    const stream = fs.createReadStream(filePath);
    const stream2 = fs.createReadStream(filePath);

    const result = await upload([stream, stream2], { originalname: 'une simple image.png' });

    await finished(stream);
    await finished(stream2);

    expect(result[0]).toMatchObject({
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
    expect(isStream(result[0].stream)).toBe(true);

    expect(result[1]).toMatchObject({
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
    expect(isStream(result[1].stream)).toBe(true);

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
    const stream2 = fs.createReadStream(filePath);

    const result = await upload({
      profileImage: [[stream, stream2], { originalname: 'image-de-profil.png' }]
    }, { sharedContext: 42 });

    await finished(stream);
    await finished(stream2);

    const { profileImage } = result;
    const [first, second] = profileImage;

    // first
    expect(first[0]).toMatchObject({
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
    expect(isStream(first[0].stream)).toBe(true);

    expect(first[1]).toMatchObject({
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
    expect(isStream(first[1].stream)).toBe(true);

    // second
    expect(second[0]).toMatchObject({
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
    expect(isStream(second[0].stream)).toBe(true);

    expect(second[1]).toMatchObject({
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
    expect(isStream(second[1].stream)).toBe(true);

    // Check image sizes
    const smallImage = await axios.get(first[0].uploadValue.Location);
    expect(smallImage.headers['content-length']).toBe(stream.bytesRead.toString());

    const largeImage = await axios.get(first[1].uploadValue.Location);
    expect(largeImage.headers['content-length']).toBe(stream.bytesRead.toString());

    await Promise.all([
      upload.providers.s3.remove('image-de-profil_small.png'),
      upload.providers.s3.remove('image-de-profil_large.png')
    ]);
  });
});
