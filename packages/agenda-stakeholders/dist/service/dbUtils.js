"use strict";

var utils = require('@openagenda/utils'),
    format = require('./format');

/**
 * get promises for db resources
 */

var knex,
    schemas,
    logger = require('@openagenda/logs'),
    log;

module.exports = {

  init: init,

  // get event data
  getEvent: getEvent,

  // get agenda-event reference
  getAgendaEvent: getAgendaEvent,

  // get stakeholder data
  getStakeholder: getStakeholder,

  // update agenda event reference with new stakeholder
  updateAgendaEvent: updateAgendaEvent
};

function getEvent(idNamespace, eventNamespace) {

  return function (v) {
    return knex.transaction(function (trx) {

      return trx.select('id', 'uid', 'owner_id', 'slug').from(schemas.event).where(v[idNamespace]).limit(1).offset(0);
    }).then(function (events) {

      v[eventNamespace] = events && events.length ? utils.toCamelCase(events[0]) : null;

      return v;
    });
  };
}

function getAgendaEvent(agendaNamespace, eventNamespace, destNamespace) {

  return function (v) {

    log('getAgendaEvent - agenda %s, event %s', JSON.stringify(v[agendaNamespace]), JSON.stringify(v[eventNamespace]));

    return knex.transaction(function (trx) {

      return trx.select('id', 'user_id').from(schemas.agendaEvent).where({
        event_id: v[eventNamespace].id,
        review_id: v[agendaNamespace].id
      }).limit(1).offset(0);
    }).then(function (agendaEvents) {

      if (!agendaEvents || !agendaEvents.length) {

        return v;
      }

      v[destNamespace] = utils.toCamelCase(agendaEvents[0]);

      return v;
    });
  };
}

function getStakeholder(agendaNamespace, userNamespace, destNamespace) {

  return function (v) {

    log('getStakeholder - agenda %s, user %s', JSON.stringify(v.agenda), JSON.stringify(v.user));

    return knex.transaction(function (trx) {

      var qObj = trx.select('credential', 'organization', 'store', 'review_id', 'store', 'user_id', 'id', 'created_at', 'updated_at', 'deleted_user').from(schemas.stakeholder).where('review_id', v[agendaNamespace].id);

      if (v[userNamespace].stakeholderId) {

        qObj.where('id', v[userNamespace].stakeholderId);
      } else {

        qObj.where('user_id', v[userNamespace].id);
      }

      qObj.limit(1).offset(0);

      return qObj;
    }).then(function (stakeholders) {

      v[destNamespace] = null;

      if (stakeholders && stakeholders.length) {

        v[destNamespace] = format.dbToObj(stakeholders[0]);
      }

      return v;
    });
  };
}

function updateAgendaEvent(agendaNamespace, eventNamespace, contributorNamespace) {

  return function (v) {
    return knex.transaction(function (trx) {

      return trx.table(schemas.agendaEvent).where({
        review_id: v[agendaNamespace].id,
        event_id: v[eventNamespace].id
      }).update({
        user_id: v[contributorNamespace].userId
      });
    }).then(function (result) {
      return v;
    });
  };
}

function init(config) {

  log = logger('dbUtils');

  schemas = config.schemas;

  knex = config.knex;
}
//# sourceMappingURL=dbUtils.js.map