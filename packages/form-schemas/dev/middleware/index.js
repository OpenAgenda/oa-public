export default async (req, res, next) => {
  const matchingMw = (await import(`./${req.path.split('/').pop()}.js`))
    .default;

  if (matchingMw) {
    matchingMw(req, res, next);
  } else {
    next();
  }
};
