'use strict';

/**
 * get general stats on an agenda
 */

const utils = require('@openagenda/utils');

const w = require('when');

let knex;
let schemas;

const states = {
  published: 2,
};

function _getUpcomingPublishedEvents(v) {
  let today = new Date();

  today = `${today.getFullYear()}-${utils.fZ(today.getMonth() + 1)}-${utils.fZ(today.getDate())}`;

  return knex
    .transaction((trx) =>
      trx

        .countDistinct(`${schemas.agendaEvent}.id as published_count`)

        .from(schemas.agendaEvent)

        .leftJoin(
          schemas.occurrence,
          `${schemas.agendaEvent}.event_id`,
          `${schemas.occurrence}.event_id`,
        )

        .where(function () {
          this.where('state', '=', states.published)

            .orWhere('is_published', '=', 1);
        })

        .andWhere('review_id', '=', v.agendaId)

        .andWhere('date', '>=', today))

    .then((result) => {
      v.details.upcomingPublishedEvents = result[0].published_count;

      return v;
    });
}

function _getTotalEvents(v) {
  return knex
    .transaction((trx) =>
      trx

        .count('id as total_count')

        .from(schemas.agendaEvent)

        .where('review_id', '=', v.agendaId))

    .then((result) => {
      v.details.totalEvents = result[0].total_count;

      return v;
    });
}

function _getPublishedEvents(v) {
  return knex
    .transaction((trx) =>
      trx

        .count('id as published_count')

        .from(schemas.agendaEvent)

        .where(function () {
          this.where('state', '=', states.published)

            .orWhere('is_published', '=', 1);
        })

        .andWhere('review_id', '=', v.agendaId))

    .then((result) => {
      v.details.publishedEvents = result[0].published_count;

      return v;
    });
}

function getAgendaDetails(agendaId, cb) {
  if (!knex) return cb('no config');

  w({
    agendaId,
    details: {
      publishedEvents: 0,
      upcomingPublishedEvents: 0,
      totalEvents: 0,
    },
  })
    .then(_getPublishedEvents)

    .then(_getUpcomingPublishedEvents)

    .then(_getTotalEvents)

    .done((v) => {
      cb(null, v.details);
    }, cb);
}

function loadAgendaDetails(agenda) {
  return new Promise((resolve, reject) => {
    getAgendaDetails(agenda.id, (err, details) => {
      if (err) return reject(err);

      utils.extend(agenda, details);

      resolve(agenda);
    });
  });
}

module.exports = getAgendaDetails;

module.exports.load = loadAgendaDetails;

module.exports.init = (s, k) => {
  schemas = s;
  knex = k;
};
