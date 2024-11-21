import _ from 'lodash';
import logs from '@openagenda/logs';
import loadControlData from './utils/loadControlData.js';
import loadEmbedControlData from './utils/loadEmbedControlData.js';
import rebuild, { isRebuilding } from './rebuild.js';
import queue from './queue.js';

const log = logs('controlData/middleware');

function _getPublishedEventsCount(knex, agendaUid) {
  return knex
    .count('id as count')
    .from('agenda_event')
    .where({
      agenda_uid: agendaUid,
      state: 2,
    })
    .then((r) => _.first(r))
    .then((r) => (r ? r.count : 0));
}

function _sendResult(req, res, agendaUid, ctlDataStr, embedCtlDataStr) {
  log('retrieved control data for agenda %s', agendaUid);

  let body = ctlDataStr;

  if (embedCtlDataStr) {
    body = body.replace(/}$/, `,"ebd" : ${embedCtlDataStr}}`);
  }

  body = `{"success":true,"code":200,"data":${body}}`;

  if (req.query.callback) {
    body = `${req.query.callback}(${body})`;
  }

  res.set({
    'Content-Type': 'application/javascript',
    'Content-Length': body.length,
  });

  res.send(body);
}

async function embed({ prefix, knex, redis, imagePath }, req, res, next) {
  const embedUid = _.get(req, 'params.embedUid');

  log('fetching control data for embed %s', embedUid);

  try {
    req.embedControlDataStr = await loadEmbedControlData(
      { prefix, knex, redis, imagePath },
      embedUid,
    );
  } catch (e) {
    log('error', 'could not load embed %s', embedUid, e);
  }

  next();
}

async function main({ prefix, knex, redis }, req, res, next) {
  const agendaUid = _.get(req, 'agenda.uid');

  if (!agendaUid) return next(new Error('Identifier is missing'));

  log('fetching control data for agenda %s', agendaUid);

  try {
    const ctlDataStr = await loadControlData(redis, prefix, agendaUid, {
      parse: false,
      initialize: false,
    });

    if (ctlDataStr) {
      return _sendResult(
        req,
        res,
        agendaUid,
        ctlDataStr,
        req.embedControlDataStr,
      );
    }

    log('no control data was retrieved for agenda %s', agendaUid);

    if (await _getPublishedEventsCount(knex, agendaUid) < 300) {
      return _sendResult(
        req,
        res,
        agendaUid,
        JSON.stringify(await rebuild({ prefix, knex, redis }, agendaUid)),
        req.embedControlDataStr,
      );
    }

    if (!await isRebuilding(redis, prefix, agendaUid)) {
      queue({ prefix, redis }, 'rebuild', agendaUid);
    }

    (req.query.callback ? res.jsonp : res.json).call(res, {
      rebuilding: true,
    });
  } catch (e) {
    next(e);
  }
}

export default _.assign(main, { embed });
