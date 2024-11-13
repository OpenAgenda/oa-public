import 'dotenv/config';

import path from 'node:path';
import { promisify } from 'node:util';
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import qs from 'qs';
import sass from 'sass';

const { AGENDA_UID, API_KEY } = process.env;

const app = express();

app.set('query parser', (str) =>
  qs.parse(str, { allowPrototypes: true, arrayLimit: Infinity }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(
  '/react-filters.js',
  express.static(path.join(import.meta.dirname, '../dist/main.js')),
);
app.use('/main.css', (req, res) => {
  const result = sass.renderSync({
    file: path.join(import.meta.dirname, 'scss/main.scss'),
    includePaths: [
      path.join(import.meta.dirname, '../node_modules'), // react-filters
      path.join(import.meta.dirname, '../../node_modules'), // public
      path.join(import.meta.dirname, '../../../node_modules'), // oa
    ],
  });

  res.type('css');
  res.send(result.css.toString());
});

app.use(express.static(path.join(import.meta.dirname, 'assets')));

app.get('/', async (req, res, next) => {
  try {
    // load events
    const { data } = await axios.get(
      `https://api.openagenda.com/v2/agendas/${AGENDA_UID}/events`,
      {
        params: {
          ...req.query,
          detailed: true,
          key: API_KEY,
        },
        paramsSerializer: qs.stringify,
      },
    );

    // render
    res.render('index', { events: data.events, agendaUid: AGENDA_UID });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

app.get('/events', async (req, res, next) => {
  try {
    // load events
    const { data } = await axios.get(
      `https://api.openagenda.com/v2/agendas/${AGENDA_UID}/events`,
      {
        params: {
          ...req.query,
          detailed: true,
          key: API_KEY,
        },
        paramsSerializer: qs.stringify,
      },
    );

    // render
    const render = promisify(app.render.bind(app));

    // create html for each event
    let listHtml = '';

    for (const event of data.events) {
      listHtml += await render('event', { ...event, agendaUid: AGENDA_UID });
    }

    res.json({ ...data, html: listHtml });
  } catch (e) {
    next(e);
  }
});

app.listen(process.env.port || 3000);

console.log('Running server on port 3000');
