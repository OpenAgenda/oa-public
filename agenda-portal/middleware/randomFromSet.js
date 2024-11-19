import shuffleArray from '../utils/shuffleArray.js';

export default (req, res, next) => {
  if (req.query && req.query.subsetRandom) {
    shuffleArray(req.data.events);
    req.data = Object.assign(req.data || {}, {
      events: req.data.events.slice(0, req.query.subsetRandom),
    });
  }

  next();
};
