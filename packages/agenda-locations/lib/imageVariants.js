import crypto from 'node:crypto';

export default (Files) => {
  const { gm } = Files;

  return [
    {
      getFilename: (info, context) =>
        `location${context.uid}.${crypto.randomUUID().replace(/-/g, '')}.jpg`,
      transform: (info, context) => {
        context.providerParams.ContentType = 'image/jpeg';

        return gm(info.stream, context.originalname)
          .autoOrient()
          .noProfile()
          .stream('jpg');
      },
    },
    {
      getFilename: (info, context) =>
        `location${context.uid}_sm.${crypto.randomUUID().replace(/-/g, '')}.jpg`,
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
      getFilename: (info, context) =>
        `location${context.uid}_o.${crypto.randomUUID().replace(/-/g, '')}.jpg`,
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
