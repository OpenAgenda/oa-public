'use strict';

require('dotenv').config();

const path = require('path');
const { promisify } = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');
const sass = require('sass');

const { AGENDA_UID, API_KEY } = process.env;

const app = express();

app.set('query parser', str => qs.parse(str, { allowPrototypes: true, arrayLimit: Infinity }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/react-filters.js', express.static(path.join(__dirname, '../dist/main.js')));
app.use('/main.css', (req, res) => {
  const result = sass.renderSync({
    file: path.join(__dirname, 'scss/main.scss'),
    includePaths: [
      path.join(__dirname, '../node_modules'), // react-filters
      path.join(__dirname, '../../node_modules'), // public
      path.join(__dirname, '../../../node_modules') // oa
    ]
  });

  res.type('css');
  res.send(result.css.toString());
});

app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', async (req, res, next) => {
  try {
    // load events
    const { data } = await axios.get(`https://api.openagenda.com/v2/agendas/${AGENDA_UID}/events`, {
      params: {
        ...req.query,
        detailed: true,
        key: API_KEY
      },
      paramsSerializer: qs.stringify
    });

    // render
    res.render('index', { events: data.events });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

app.get('/events', async (req, res, next) => {
  try {
    // load events
    const { data } = await axios.get(`https://api.openagenda.com/v2/agendas/${AGENDA_UID}/events`, {
      params: {
        ...req.query,
        detailed: true,
        key: API_KEY
      },
      paramsSerializer: qs.stringify
    });

    // render
    const render = promisify(app.render.bind(app));

    // create html for each event
    let listHtml = '';

    for (const event of data.events) {
      listHtml += await render('event', event);
    }

    res.json({ ...data, html: listHtml });
  } catch (e) {
    next(e);
  }
});

app.listen(process.env.port || 3000);

console.log('Running server on port 3000');
