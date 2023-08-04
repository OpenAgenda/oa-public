'use strict';

module.exports = app => {
  app.get(
    [
      '/:agendaSlug/addevent',
      '/:agendaSlug/event/:eventSlug/edit',
    ],
    (req, res) => {
      res.redirect(
        301,
        req.event ? `/${req.agenda.slug}/contribute/event/${req.event.uid}` : `/${req.agenda.slug}/contribute`,
      );
    },
  );
};
