
'use strict';

const serverApp = require('../stories/server');

module.exports = router => {
  console.log('init server')
  router.use(serverApp);
} 