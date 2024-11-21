import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import reload from 'reload';
import pages from './index.js';

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;

const style = fs.readFileSync(
  fileURLToPath(
    import.meta.resolve('@openagenda/bs-templates/compiled/main.css'),
  ),
);

app.get(/css$/, (req, res) => {
  res.type('text/css');
  res.send(style);
});

app.get(/ico$/, (req, res) => {
  res.send('favicon');
});

app.get('/', (req, res, next) => {
  req.optionalData = {
    events: '12 345',
    agendas: '83 929',
    contributors: '98 908',
  };

  next();
});

app.get(['/:page', '/'], (req, res, next) => {
  const p = pages(`http://${req.hostname}:${port}`); // reload the thing

  const page = req.params.page || null;

  try {
    req.content = p(page).render(req.optionalData);

    req.headPart = p(page).getHeadPart();

    next();
  } catch (e) {
    console.log(e);

    next(404);
  }
});

app.use(
  '/fonts',
  express.static(`${import.meta.dirname}/node_modules/font-awesome/fonts`),
);

reload(app);

app.get('*', (req, res) => {
  const layout = fs.readFileSync(`${import.meta.dirname}/layout.html`, 'utf-8');

  res.type('text/html');

  if (!req.content) {
    req.content = 'no content is defined';
  }

  res.send(
    layout
      .replace('<!--content-->', req.content)
      .replace('<!--head-->', req.headPart),
  );
});

server.listen(port, '0.0.0.0');
