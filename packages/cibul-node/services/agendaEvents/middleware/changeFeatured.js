import makeLabelGetter from '@openagenda/labels';
import statelabels from '@openagenda/labels/event/states.js';
import base64 from '@openagenda/utils/base64.js';
import { setFlash } from '../../../lib/flash.js';

const getLabel = makeLabelGetter(statelabels);

export default (req, res, next) => {
  req.log.debug('updating featured to %s', req.params.type);

  const { core } = req.app.services;

  core
    .agendas(req.agenda.uid)
    .events.patch(
      req.event.uid,
      {
        featured: req.params.type === 'featured',
      },
      {
        userUid: req.user.uid,
      },
    )
    .then(() => {
      setFlash(
        res,
        getLabel(
          req.params.type === 'featured'
            ? 'featuredChange'
            : 'unfeaturedChange',
          req.lang,
        ),
      );

      res.redirect(
        302,
        req.query.redirect
          ? base64.decode(req.query.redirect)
          : `/${req.agenda.slug}/events/${req.event.slug}`,
      );
    }, next);
};
