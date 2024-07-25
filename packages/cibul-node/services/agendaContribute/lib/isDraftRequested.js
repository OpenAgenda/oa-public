export default (assignToReq = {}) => (req, res, next) => {
  if (['true', '1'].includes(req.query?.draft)) {
    Object.assign(req, assignToReq);
  }
  next();
};
