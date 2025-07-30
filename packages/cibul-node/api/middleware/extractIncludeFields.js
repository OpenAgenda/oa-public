export default function extractIncludeFields(req, res, next) {
  req.includeFields = null;
  const key = ['if', 'includeFields', 'fields'].find((k) => !!req.query[k]);

  req.includeFields = key ? req.query[key] : null;

  next();
}
