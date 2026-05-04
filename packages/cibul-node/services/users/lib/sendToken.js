import logs from '@openagenda/logs';

const log = logs('services/users/sendToken');

export default (config, services) => async (context) => {
  const { mails } = services;

  // 'aa' / 'lp' branches removed in phase 3b (BA owns activation + reset
  // password). Legacy tokens.create() callers may still write rows of those
  // types — they expire naturally and are cleaned up in phase 6.
  try {
    const token = context.result;
    const { user } = context.params;

    if (!token) {
      return context;
    }

    if (token.type === 'uf') {
      const link = `${config.root}/unlinkFacebook/${token.token}`;

      log(`sending unlink facebook token - ${link}`);

      await mails.send({
        template: 'unlinkFacebook',
        to: token.email,
        lang: user.culture,
        data: { link, emailSettingsLink: null },
        queue: false,
      });
    }
  } catch (e) {
    log.error('Unable to send token', e);
  }

  return context;
};
