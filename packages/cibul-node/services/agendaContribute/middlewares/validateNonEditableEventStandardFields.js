'use strict';

const log = require('@openagenda/logs')('services/agendaContribute/middlewares/validateNonEditableEventStandardFields');
const labels = require('@openagenda/labels/event/form');
const errorDetailsLabels = require('@openagenda/labels/event/shareErrorDetails');
const makeLabelsGetter = require('@openagenda/labels');

const getErrorLabel = makeLabelsGetter(labels);
const getErrorDetails = makeLabelsGetter(errorDetailsLabels);

function validateNonEditableEventStandardFields(req, res, next) {
  const {
    core
  } = req.app.services;

  if (req.authorizations.canEditEvent) {
    return next();
  }

  core.agendas(req.agenda.uid).events.validate(req.event)
    .then(_clean => {
      next();
    }, err => {
      log('info', 'event fields do not validate against agenda schema', {
        eventUid: req.event.uid,
        from: req.fromAgenda.uid,
        to: req.agenda.uid,
        errors: err.info.errors
      });

      const { eventFields } = core.agendas(req.agenda.uid).events.validate;
      const eventFieldNames = eventFields.map(f => f.field);

      req.standardFieldsErrors = err.info.errors
        .filter(error => eventFieldNames.includes(error.field))
        .map(error => ({
          code: error.code,
          codeLabel: getErrorDetails(error.code, req.lang) || getErrorLabel(error.code, req.lang),
          field: error.field,
          fieldLabel: eventFields.find(field => error.field === field.field)?.label?.[req.lang]
        }));

      next();
    });
}

module.exports = validateNonEditableEventStandardFields;
