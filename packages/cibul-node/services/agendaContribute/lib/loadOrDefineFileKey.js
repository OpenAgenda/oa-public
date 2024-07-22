import uuidV4 from 'uuid/v4.js';

export default function loadOrDefineFileKey(req, res, next) {
  req.fileKey = req?.event?.fileKey ?? uuidV4().replace(/-/g, '');

  next();
}
