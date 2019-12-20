"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

module.exports = async ( req, res, next ) => {
  const remove = req.services.core.agendas(req.agenda.uid).events.remove;

  try {
    const event = await remove(req.event.uid, {
      context: {
        agendaUid: req.agenda.uid,
        userUid: req.user.uid
      }
    });

    res.json( {
      success,
      event
    });
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res.status(400).json({
        errors: e.detail
      });
    } else {
      next(new VError(e, 'remove error'));
    }
  }
}
