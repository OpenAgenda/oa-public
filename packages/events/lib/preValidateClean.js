'use strict';

const https = require('https');
const fs = require('fs');

const axios = require('axios');
const ih = require('immutability-helper');

async function handleNonStreamImage(update, image, options = {}) {
  const {
    maxImageSize
  } = {
    maxImageSize: 20971520,
    ...options
  };

  if (image === undefined) {
    return;
  }

  if (image === null) {
    update.image = {
      $set: null
    };
    return;
  }

  if (image?.url) {
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      headers: {
        'User-Agent': 'OA',
        'Accept-Charset': '*',
        Accept: '*/*'
      },
      timeout: 10000,
      responseType: 'stream',
      maxContentLength: maxImageSize
    });

    update.image = {
      $set: await axiosInstance.get(image?.url).then(response => response?.data)
    };
    return;
  }

  if (image?.filename === null) {
    update.image = {
      $set: null
    };
    return;
  }

  if (image?.path && !image?._readableState) {
    const rd = fs.createReadStream(image?.path);
    rd.on('close', () => fs.unlink(image.path, () => {}));

    update.image = {
      $set: rd
    };
    return;
  }

  if (typeof image?.filename === 'string' && !('transformAndUpload' in image)) {
    update.$unset.push('image');
  }
}

module.exports = async (data, options) => {
  const update = {
    $unset: []
  };

  await handleNonStreamImage(update, data?.image, options);

  if (typeof data?.location === 'object' && !data?.locationUid) {
    update.$unset.push('location');
    update.locationUid = { $set: data.location.uid };
  }

  return ih(data, update);
};
