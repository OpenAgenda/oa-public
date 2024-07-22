import model from '../model/index.js';
import * as agendaSvc from '../agenda/index.js';
import middleware from './middleware.js';

function instanciate(data) {
  const instance = model.reviewEmbeds().instance(data);

  let agenda;

  function getAgenda(cb) {
    if (agenda) return cb(null, agenda);

    instance.getAgenda((err, a) => {
      if (err) cb(err);

      agenda = agendaSvc.instanciate(a);

      cb(null, agenda);
    });
  }

  function getControlData(cb) {
    getAgenda((err, a) => {
      if (err) return cb(err);

      a.getControlData((_err, ctlData) => {
        instance.decorateAgendaControlData(ctlData, cb);
      });
    });
  }

  return {
    ...instance,
    getControlData,
  };
}

export function get(params, cb) {
  model.reviewEmbeds().get(params, (err, result) => {
    if (err) return cb(err);

    if (!result) return cb('embed configuration not found');

    cb(null, instanciate(result));
  });
}

export const mw = middleware({ get });
