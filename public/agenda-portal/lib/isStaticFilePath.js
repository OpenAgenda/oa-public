export default (req) => /\.[a-z][a-z]([a-z]|)([a-z]|)$/.test(req.originalUrl);
