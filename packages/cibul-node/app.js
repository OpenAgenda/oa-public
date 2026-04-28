import express from 'express';
import qs from 'qs';

const app = express();

app
  .set('trust proxy', ['loopback', 'uniquelocal'])
  .set('query parser', (str) =>
    qs.parse(str, { allowPrototypes: true, arrayLimit: Infinity }));

export default app;
