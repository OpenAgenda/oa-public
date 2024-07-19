import track from '../../../lib/track.js';

const trackFormat = (req, res, next) => {
  track(req, req.agenda, 'events', 'export', req.params.format);
  next();
};

export default trackFormat;
