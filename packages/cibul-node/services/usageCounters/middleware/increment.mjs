export default function increment(targetNamespace, options = {}) {
  return async function mw(req, res, next) {
    const {
      usageCounters,
    } = req.app.services;
    const values = {
      items: req?.result?.events.length,
      volume: req.contentLength,
    };

    if (req.user) {
      usageCounters.increment('user', req.user.uid, targetNamespace, values);
    } else if (req.agendaKey) {
      usageCounters.increment('agenda', req.agendaKey, targetNamespace, values);
    }
    next();
  };
}
