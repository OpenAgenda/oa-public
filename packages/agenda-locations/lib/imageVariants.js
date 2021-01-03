'use strict';

module.exports = Files => {
  const { gm } = Files;

  return [
    {
      getFilename: (info, context) => `location${context.uid}.jpg`,
      transform: (info, context) => {
        context.providerParams.ContentType = 'image/jpeg';

        return gm(info.stream, context.originalname)
          .autoOrient()
          .noProfile()
          .stream('jpg');
      },
    },
    {
      getFilename: (info, context) => `location${context.uid}_sm.jpg`,
      transform: (info, context) => {
        context.providerParams.ContentType = 'image/jpeg';
        return gm(info.stream, context.originalname)
          .autoOrient()
          .noProfile()
          .resize(600)
          .stream('jpg');
      },
    },
    {
      getFilename: (info, context) => `location${context.uid}_o.jpg`,
      transform: (info, context) => {
        context.providerParams.ContentType = 'image/jpeg';

        return gm(info.stream, context.originalname)
          .autoOrient()
          .noProfile()
          .resize(300)
          .stream('jpg');
      },
    },
  ];
};
