import _ from 'lodash';
import qs from 'qs';
import logs from '@openagenda/logs';

const log = logs('services/users/sendToken');

export default (config, services) => async (context) => {
  const { mails, genUrl } = services;

  try {
    const token = context.result;
    const { user, optionals } = context.params;

    if (!token) {
      return context;
    }

    if (token.type === 'aa') {
      const query = qs.stringify(
        _.pickBy(_.pick(optionals || {}, 'iToken', 'invitation', 'redirect')),
        {
          addQueryPrefix: true,
        },
      );

      const link = _.get(optionals, 'agenda')
        ? `${config.root}/${optionals.agenda.slug}/activate/${token.token}${query}`
        : `${config.root}/activate/${token.token}${query}`;

      log(`sending activation token - ${link}`);

      await mails.send({
        template: 'activateAccount',
        to: user.email,
        lang: user.culture,
        data: {
          activateLink: link,
          emailSettingsLink: null,
        },
        queue: false,
      });
    } else if (token.type === 'lp') {
      const link = genUrl.abs('resetPassword', { token: token.token });

      log(`sending lost password token - ${link}`);

      await mails.send({
        template: 'resetPassword',
        to: user.email,
        lang: user.culture,
        data: {
          resetLink: link,
          emailSettingsLink: null,
        },
        queue: false,
      });
    } else if (token.type === 'uf') {
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
