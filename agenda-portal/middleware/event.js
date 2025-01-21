import setPageProp from '../lib/utils/setPageProp.js';

export async function get(req, res, next) {
  const proxy = req.app.get('proxy');
  const transform = req.app.get('transforms').event.show;

  try {
    const event = await proxy.get(res.locals.agendaUid, {
      slug: req.params.slug,
    });

    if (!event) return next();

    req.data.event = transform(event, req, res);

    setPageProp(req, 'pageType', 'event');
    setPageProp(req, 'lang', res.locals.lang);
    setPageProp(req, 'defaultViewport', res.locals.agenda.summary.viewport);
    setPageProp(req, 'agendaUid', res.locals.agenda.uid);

    if (req.app.locals.tracking?.useAgendaGoogleAnalytics) {
      const gaId = res.locals.agenda.settings.tracking?.googleAnalytics || null;
      if (!gaId) {
        console.log(
          'Warning: no Google Analytics ID found. Set one in your agenda settings or disable tracking.',
        );
      }
      const { cookieBannerLink, requireConsent } = req.app.locals.tracking;
      setPageProp(req, 'gaId', gaId);
      setPageProp(req, 'cookieBannerLink', cookieBannerLink);
      setPageProp(req, 'requireConsent', requireConsent);
    }
  } catch (err) {
    return next(err);
  }

  next();
}

export function render(req, res, next) {
  if (!req.data.event) {
    return next();
  }

  if (req.query.data !== undefined && process.env.NODE_ENV === 'development') {
    return res.json(Object.assign(req.data, req.app.locals));
  }

  res.render('event', req.data);
}
