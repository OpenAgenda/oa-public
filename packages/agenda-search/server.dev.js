global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import testconfig from './testconfig';
import Service from './';
import listInterface from './test/app/listInterface';
import getAgendaSummary from './test/app/getAgendaSummary';

const app = express();

export const server = http.createServer(app);

app.server = server;

(async () => {
  const service = Service({
    elasticsearch: testconfig.elasticsearch,
    listAgendas: listInterface.bind(null, 100, a => a),
    imagePath: testconfig.imagePath,
    defaultImage: testconfig.defaultImage,
    getAgendaSummary
  });

  service.rebuild();

  app.use(morgan('dev'));

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  /*
   * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
   * */

  app.use((req, res, next) => {
    req.log = console.log;
    req.lang = 'fr';
    next();
  });

  app.get('/', service.mw.list);
  app.get('/:format', service.mw.list);

  app.use((req, res, next) => {
    if (req.content) {
      res.send(req.content);
    }

    next();
  });

  app.use(errorHandler({ log: true }));

  server.listen(process.env.PORT || 3000, () => {
    // eslint-disable-next-line no-console
    console.log(
      `\nDev server started on => http://localhost:${server.address().port}/`
   );
  });

})();

export default app;
