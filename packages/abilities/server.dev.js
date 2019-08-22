import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import abilitiesSvc from './src/service';
import testconfig from './testconfig';

const app = express();

export const server = http.createServer(app);

app.server = server;

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

if (process.env.NODE_ENV !== 'test') {
  abilitiesSvc.init(testconfig);
}

if (['development', 'test'].includes(process.env.NODE_ENV)) {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET http://localhost:3000/abilities/form-index?entityName=user&identifier=99999999
app.get(
  '/abilities/form-index',
  abilitiesSvc.middleware.getFormIndex({
    namespaces: {
      entityName: 'query.entityName',
      identifier: 'query.identifier'
    }
  })
);

// PATCH http://localhost:3000/abilities/form-index?entityName=user&identifier=99999999
app.patch(
  '/abilities/form-index',
  abilitiesSvc.middleware.updateFormIndex({
    namespaces: {
      entityName: 'query.entityName',
      identifier: 'query.identifier',
      data: 'body'
    }
  })
);

app.use(errorHandler({ log: true }));

if (process.env.NODE_ENV !== 'test') {
  server.listen(process.env.PORT || 3000, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Dev server started on => http://localhost:${server.address().port}/`
    );
  });
}

export default app;
