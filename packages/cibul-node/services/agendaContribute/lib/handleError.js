'use strict';

module.exports = function handleError({ res, log }, error) {
  if (error.name === 'BadRequest') {
    log('error', 'validation errors', error.info);

    res.status(400);

    res.json({
      success: false,
      errors: error.info,
      event: null
    });
  } else {
    log('error', error);

    res.status(500);

    res.json({
      success: false,
      event: null
    });
  }
};
