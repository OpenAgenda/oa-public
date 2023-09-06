'use strict';

module.exports = req => /\.[a-z][a-z]([a-z]|)([a-z]|)$/.test(req.originalUrl);
