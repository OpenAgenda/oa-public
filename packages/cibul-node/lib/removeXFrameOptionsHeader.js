export default async function removeXFrameOptionsHeader(req, res, next) {
  res.removeHeader('X-Frame-Options');
  next();
}
