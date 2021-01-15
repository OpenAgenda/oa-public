'use strict';

const { promisify } = require('util');

module.exports = Files => {
  const { gm } = Files;

  return [{
    getFilename: (info, context) => `${context.fileKey}.base.image.jpg`,
    transform: async (info, context) => {
      const image = gm(info.stream, context.originalname)
        .autoOrient()
        .noProfile()
        .resize(700)
        .stream('jpg');

      context.providerParams.ContentType = 'image/jpeg';
      info.type = 'base';

      const sizeGm = gm(image);

      info.size = await promisify(sizeGm.size).call(sizeGm, { bufferStream: true });

      return sizeGm.stream('jpg');
    }
  }, {
    getFilename: (info, context) => `${context.fileKey}.full.image.jpg`,
    transform: async (info, context) => {
      const image = gm(info.stream, context.originalname)
        .autoOrient()
        .noProfile()
        .stream('jpg');

      context.providerParams.ContentType = 'image/jpeg';
      info.type = 'full';

      const sizeGm = gm(image);

      info.size = await promisify(sizeGm.size).call(sizeGm, { bufferStream: true });

      return sizeGm.stream('jpg');
    }
  }, {
    getFilename: (info, context) => `${context.fileKey}.thumb.image.jpg`,
    transform: (info, context) => {
      context.providerParams.ContentType = 'image/jpeg';
      info.type = 'thumbnail';
      info.size = {
        width: 200,
        height: 200
      };

      return gm(info.stream, context.originalname)
        .autoOrient()
        .noProfile()
        .resize(200, 200, '^')
        .gravity('Center')
        .crop(200, 200)
        .stream('jpg');
    }
  }]
}