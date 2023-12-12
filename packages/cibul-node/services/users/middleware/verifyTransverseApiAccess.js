'use strict';

module.exports = async (req, res, next) => {
  if (!req?.user?.transverseApiAccess) {
    return res.status(403).json({
      error: 'Not authorized, contact support@openagena.com to request access.',
    });
  }
  next();
};
