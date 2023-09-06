"use strict";

const { createLogger2 } = require('../');

describe('Logger', () => {
  describe('basic logger', () => {
    it('should works', async () => {
      const logger = createLogger2('req')
        .loadMetadata({
          module: 'home',
          ip: '1.2.3.4',
        });

      const promise = new Promise(resolve => {
        logger.on('logging', (_logger, level, msg, meta) => {
          resolve({ level, msg, meta });
        });
      });

      logger.info('This is an info');

      const result = await promise;

      expect(result).toEqual({
        level: 'info',
        msg: 'This is an info',
        meta: { module: 'home', ip: '1.2.3.4' },
      });
    });
  });
});
