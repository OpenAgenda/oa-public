'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');
const finished = promisify(require('node:stream').finished);
const isStream = require('is-stream');
const Files = require('../lib');
const testconfig = require('../testconfig');
const { formatLocation } = require('./utils');

const { endpoint, projectId, defaultBucket: bucket } = testconfig.s3;

describe('transform', () => {
  let service;

  jest.setTimeout(30000);

  beforeAll(() => {
    service = Files(testconfig);
  });

  afterAll(async () => {
    await Promise.all([
      service.providers.s3.remove('josep_aff_renamed.jpg'),
      service.providers.s3.remove('src3_renamed.png'),
      service.providers.s3.remove('josep_aff_work.jpg'),
      service.providers.s3.remove('josep_aff_fail.jpg'),
      service.providers.s3.remove('src3_detected.jpg'),
      service.providers.s3.remove('src3_binary.jpg'),
      service.providers.s3.remove('src3_image.jpg'),
    ]);
  });

  it('works with a webp image', async () => {
    const upload = service({
      key: 'image',
      getFilename: (info, context) =>
        `${path.parse(context.originalname).name}_renamed${
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
      path.join(__dirname, 'files/josep_aff.jpg'),
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
        // Location: s3UrlMatching('josep_aff_renamed.jpg'),
        key: 'josep_aff_renamed.jpg',
        Key: 'josep_aff_renamed.jpg',
        Bucket: `${bucket}`,
      }),
    });
    expect(isStream(result.stream)).toBe(true);
  });

  it('abort all uploads on failure', async () => {
    let resolve;
    const promise = new Promise((res) => {
      resolve = res;
    });
    const upload = service([
      {
        key: 'image',
        getFilename: (info, context) =>
          `${path.parse(context.originalname).name}_renamed${
            path.parse(context.originalname).ext
          }`,
      },
      {
        key: 'buggy',
        variants: [
          {
            getFilename: (info, context) =>
              `${path.parse(context.originalname).name}_work${
                path.parse(context.originalname).ext
              }`,
            transform: async (info) => {
              resolve();
              return info.stream;
            },
          },
          {
            getFilename: (info, context) =>
              `${path.parse(context.originalname).name}_fail${
                path.parse(context.originalname).ext
              }`,
            transform: async () => {
              await promise; // wait for the first variant
              throw new Error('Ca ne marche pas !');
            },
          },
        ],
      },
    ]);

    const stream1 = fs.createReadStream(path.join(__dirname, 'files/src3.png'));
    const stream2 = fs.createReadStream(
      path.join(__dirname, 'files/josep_aff.jpg'),
    );

    await expect(
      upload({
        image: stream1,
        buggy: stream2,
      }),
    ).rejects.toThrow('Ca ne marche pas !');

    await finished(stream1).catch(() => null);
    await finished(stream2).catch(() => null);

    // Images removed
    await expect(
      fetch(
        formatLocation({ endpoint, projectId, bucket }, 'src3_renamed.png'),
      ).then((response) => {
        if (!response.ok) {
          throw new Error(`Invalid status (${response.status})`);
        }
        return response.text();
      }),
    ).rejects.toThrow('Invalid status (404)');
    await expect(
      fetch(
        formatLocation({ endpoint, projectId, bucket }, 'josep_aff_work.jpg'),
      ).then((response) => {
        if (!response.ok) {
          throw new Error(`Invalid status (${response.status})`);
        }
        return response.text();
      }),
    ).rejects.toThrow('Invalid status (404)');
    await expect(
      fetch(
        formatLocation({ endpoint, projectId, bucket }, 'josep_aff_fail.jpg'),
      ).then((response) => {
        if (!response.ok) {
          throw new Error(`Invalid status (${response.status})`);
        }
        return response.text();
      }),
    ).rejects.toThrow('Invalid status (404)');
  });

  it('set content type', async () => {
    const upload = service({
      key: 'image',
      variants: [
        {
          getFilename: (info, context) =>
            `${path.parse(context.originalname).name}_detected${
              path.parse(context.originalname).ext
            }`,
        },
        {
          getFilename: (info, context) =>
            `${path.parse(context.originalname).name}_binary${
              path.parse(context.originalname).ext
            }`,
          transform: (info) => info.stream,
        },
        {
          getFilename: (info, context) =>
            `${path.parse(context.originalname).name}_image${
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
      fetch(
        formatLocation(
          { endpoint, projectId, bucket },
          detected.uploadValue.key,
        ),
      ),
      fetch(
        formatLocation({ endpoint, projectId, bucket }, binary.uploadValue.key),
      ),
      fetch(
        formatLocation({ endpoint, projectId, bucket }, image.uploadValue.key),
      ),
    ]);

    const headers = imagesFromS3.map((v) => v.headers.get('content-type'));

    expect(headers).toEqual([
      'image/png',
      'application/octet-stream',
      'image/png',
    ]);
  });
});
