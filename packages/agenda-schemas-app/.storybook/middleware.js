import serverApp from '../stories/server/index.js';

export default (router) => {
  console.log('init server');
  router.use(serverApp);
};
