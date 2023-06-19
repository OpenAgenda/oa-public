import _ from 'lodash';
import bodyParser from 'body-parser';
import qs from 'qs';
import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';

const log = logs('api/middleware/parseBodyData');

function parseTalendBody(req, res, next) {
  let rawBody = '';
  req.setEncoding('utf8');

  req.on('data', chunk => {
    rawBody += chunk;
  });
  req.on('end', () => {
    try {
      const parsed = qs.parse(rawBody);
      req.body = {
        ...parsed,
        data: JSON.parse(parsed.data),
      };
      next();
    } catch (e) {
      next(e);
    }
  });
  req.on('error', next);
}

export default [
  (req, res, next) => {
    let parser;

    if (req.headers['content-type'] === 'raw') {
      log('applying talend body parser');
      parser = parseTalendBody;
    } else if (
      (req.headers['content-type'] !== 'application/json')
      && req.method !== 'PATCH'
    ) {
      log('applying raw body parser with inflate');
      parser = bodyParser.raw({
        inflate: true,
        limit: '500kb',
        type: 'text/plain',
      });
    } else {
      log('applying json body parser');
      parser = bodyParser.json();
    }

    parser(req, res, err => {
      if (err?.type === 'entity.parse.failed') {
        next(new BadRequest(err.message));
        return;
      }
      next(err);
    });
  },
  (req, res, next) => {
    if (_.isBuffer(req.body)) {
      req.body = qs.parse(req.body.toString());
    }

    req.parsedData = req.body.data || req.body;

    log('got %j', req.parsedData);

    try {
      if (typeof req.parsedData === 'string') {
        req.parsedData = JSON.parse(req.parsedData);
      }
    } catch (e) {
      return res.status(400).json({
        error: 'provided json is invalid',
        agendaUid: req.params.agendaUid,
        body: req.body,
      });
    }

    next();
  },
];
