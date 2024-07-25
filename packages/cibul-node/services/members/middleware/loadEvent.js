function loadBy({ agenda }) {
  return (req, res, next) => {
    const {
      events,
      agendaEvents,
    } = req.app.services;
    events.get({ slug: req.params.eventSlug }, { private: null, access: 'internal' }).then(event => {
      if (!event) return next(new Error('Event not found'));
      agendaEvents(req[agenda].uid).get(event.uid).then(ae => {
        if (!ae) {
          return next(new Error('Event is not associated with agenda'));
        }
        req.event = event;
        next();
      });
    });
  };
}

export default loadBy({ agenda: 'agenda' });
export { loadBy as by };
