import controlData from './controlData/index.js';

export default ({ knex, redis }) => ({
  controlData: controlData.bind(null, { knex, redis }),
});
