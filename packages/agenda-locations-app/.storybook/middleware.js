
'use strict';

const serverApp = require('../stories/server');

module.exports = router => {
  router.use(serverApp);
} 