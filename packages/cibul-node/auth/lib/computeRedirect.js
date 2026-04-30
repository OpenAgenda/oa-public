import logs from '@openagenda/logs';

const unlinkFacebookLog = logs('auth/unlinkFacebook');

export default function computeRedirect(req, user) {
  let agendaSlug;
  if (req.query?.agenda) {
    agendaSlug = req.query.agenda;
  } else if (req.agenda) {
    agendaSlug = req.agenda.slug;
  }

  let redirectUrl;

  if (req.query?.redirect) {
    try {
      redirectUrl = Buffer.from(req.query.redirect, 'base64').toString();
    } catch (e) {
      req.log?.error?.('could not decode redirect %s', req.query.redirect);
    }
  } else if (req.query?.iToken && agendaSlug) {
    redirectUrl = `/${agendaSlug}/contribute`;
  }

  if (user?.facebookUid) {
    unlinkFacebookLog.info(
      'facebook signin detected, redirecting user to migration page',
      {
        userUid: user.uid,
        facebookUid: user.facebookUid,
      },
    );
    redirectUrl = '/settings/unlinkFacebook';
  }

  const defaultRedirect = agendaSlug ? `/${agendaSlug}/contribute` : '/home';
  return redirectUrl || defaultRedirect;
}
