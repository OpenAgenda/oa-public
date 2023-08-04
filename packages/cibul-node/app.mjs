import express from 'express';
import bodyParser from 'body-parser';
import qs from 'qs';
import Sentry from '@sentry/node';

const app = express();

function rawBodySaver(req, res, buf) {
  req.rawBody = buf;
}

app
  .set('trust proxy', ['loopback', 'uniquelocal'])
  .set('query parser', str => qs.parse(str, { allowPrototypes: true, arrayLimit: Infinity }))
  .use(Sentry.Handlers.requestHandler())
  .use(bodyParser.json({ limit: '5mb', verify: rawBodySaver }))
  .use(bodyParser.urlencoded({ limit: '500kb', extended: true, verify: rawBodySaver }));

export default app;
