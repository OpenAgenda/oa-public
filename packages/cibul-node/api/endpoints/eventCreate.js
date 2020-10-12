"use strict";

const _ = require('lodash');
const ih = require('immutability-helper');
const VError = require('verror');
const log = require('@openagenda/logs')('api/eventCreate');

module.exports = async (req, res, next) => {
  const create = req.app.core.agendas(req.agenda.uid).events.create;

  try {
    const event = await create(ih(req.parsedData, {
      ownerUid: { $set: req.user.uid },
      creatorUid: { $set: req.user.uid },
      agendaUid: { $set: req.agenda.uid }
    }), {
      context: {
        userUid: req.member.userUid
      },
      access: req.access,
      defaultLang: req.headers.lang
    });

    res.json({
      success: true,
      event
    });
  } catch(e) {
    if (e.name === 'ValidationError') {
      return res.status(400).json({
        errors: e.detail
      });
    } else {
      next(new VError(e, 'create error'));
    }
  }
}
