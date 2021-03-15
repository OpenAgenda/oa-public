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

describe('transform', () => {
  let service;

  jest.setTimeout(30000);

  beforeAll(() => {
    service = Files(testconfig);
  });

  it('works with a webp image', async () => {
    const upload = service({
      key: 'image',
      getFilename: (info, context) => `${path.parse(context.originalname).name}_renamed${
        path.parse(context.originalname).ext
      }`,
      transform: async (info, context) => {
        const image = service.gm(info.stream, context.originalname);

        const size = await promisify(image.size).call(image, {
          bufferStream: true,
        });

        image.resize(size.width / 2, size.height / 2);

        return image.resize(size.width / 2, size.height / 2).stream('jpg');
      },
    });

    const stream = fs.createReadStream(
      path.join(__dirname, 'files/josep_aff.jpg')
    );

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
        Bucket: `${bucket}`,
      }),
    });
    expect(isStream(result.stream)).toBe(true);

    await upload.providers.s3.remove('josep_aff_renamed.jpg');
  });

  it('abort all uploads on failure', async () => {
    const upload = service([
      {
        key: 'image',
        getFilename: (info, context) => `${path.parse(context.originalname).name}_renamed${
          path.parse(context.originalname).ext
        }`,
      },
      {
        key: 'buggy',
        variants: [
          {
            getFilename: (info, context) => `${path.parse(context.originalname).name}_work${
              path.parse(context.originalname).ext
            }`,
          },
          {
            getFilename: (info, context) => `${path.parse(context.originalname).name}_fail${
              path.parse(context.originalname).ext
            }`,
            transform: () => {
              throw new Error('Ca ne marche pas !');
            },
          },
        ],
      },
    ]);

    const stream1 = fs.createReadStream(path.join(__dirname, 'files/src3.png'));
    const stream2 = fs.createReadStream(
      path.join(__dirname, 'files/josep_aff.jpg')
    );

    await expect(
      upload({
        image: stream1,
        buggy: stream2,
      })
    ).rejects.toThrow('Ca ne marche pas !');

    await finished(stream1);
    await finished(stream2);

    // Images removed
    await expect(
      axios.get(`https://${bucket}.s3.amazonaws.com/src3_renamed.png`)
    ).rejects.toThrow('Request failed with status code 404');
    await expect(
      axios.get(`https://${bucket}.s3.amazonaws.com/josep_aff_work.jpg`)
    ).rejects.toThrow('Request failed with status code 404');
    await expect(
      axios.get(`https://${bucket}.s3.amazonaws.com/josep_aff_fail.jpg`)
    ).rejects.toThrow('Request failed with status code 404');

    await Promise.all([
      upload.providers.s3.remove('src3_renamed.png'),
      upload.providers.s3.remove('josep_aff_work.jpg'),
      upload.providers.s3.remove('josep_aff_fail.jpg'),
    ]);
  });

  it('set content type', async () => {
    const upload = service({
      key: 'image',
      variants: [
        {
          getFilename: (info, context) => `${path.parse(context.originalname).name}_detected${
            path.parse(context.originalname).ext
          }`,
        },
        {
          getFilename: (info, context) => `${path.parse(context.originalname).name}_binary${
            path.parse(context.originalname).ext
          }`,
          transform: info => info.stream,
        },
        {
          getFilename: (info, context) => `${path.parse(context.originalname).name}_image${
            path.parse(context.originalname).ext
          }`,
          transform: (info, context) => {
            context.providerParams.ContentType = 'image/png';

            return info.stream;
          },
        },
      ],
    });

    const stream = fs.createReadStream(path.join(__dirname, 'files/src3.png'));

    const result = await upload({
      image: stream,
    });

    const [detected, binary, image] = result.image;

    await finished(stream);

    const imagesFromS3 = await Promise.all([
      axios.get(detected.uploadValue.Location),
      axios.get(binary.uploadValue.Location),
      axios.get(image.uploadValue.Location),
    ]);

    const headers = imagesFromS3.map(v => v.headers['content-type']);

    expect(headers).toEqual([
      'image/png',
      'application/octet-stream',
      'image/png',
    ]);

    await Promise.all([
      upload.providers.s3.remove('src3_detected.png'),
      upload.providers.s3.remove('src3_binary.png'),
      upload.providers.s3.remove('src3_image.png'),
    ]);
  });
});
