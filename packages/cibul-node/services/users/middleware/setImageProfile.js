'use strict';

const imageUploadMw = require('@openagenda/image-upload/lib/middleware');
const config = require('../../../config');

module.exports = service => (req, res, next) => {
  imageUploadMw({
    dest: config.tmpFolderPath,
    handler: async (path, info, cb) => {
      try {
        const result = await service.setImageProfile(
          req.params.__feathersId,
          { path },
          {
            ...req.feathers,
            provider: 'rest',
            query: req.query
          }
        );

        res.data = result;

        cb(null, result.uploadedPaths[0]);
      } catch (e) {
        next(e);
      }
    }
  })(req, res, next);
};
