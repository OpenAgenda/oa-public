const express = require('express');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const knexLib = require('knex');
const agendasSvc = require('@openagenda/agendas');
const keysSvc = require('@openagenda/keys');
const keysMw = require('@openagenda/keys/middleware');
const service = require('../src/service');
const mw = require('../src/middleware');
const testconfig = require('../testconfig');

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

if (process.env.NODE_ENV !== 'test') {
  (async () => {
    agendasSvc.init(testconfig);

    service.init(Object.assign(testconfig, {
      services: {
        agendas: agendasSvc
      }
    }));

    // avoid migrations and do it in fixtures.js
    await keysSvc.init(Object.assign(testconfig, {
      migrations: null,
      knex: knexLib({
        client: 'mysql',
        connection: testconfig.mysql
      })
    }));
  })();
}

module.exports = router => {
  if (['development', 'test'].includes(process.env.NODE_ENV)) {
    router.use(morgan('dev'));
  }

  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));

  router.use((req, res, next) => {
    req.user = { id: 2 };
    req.agenda = {
      uid: 17026855,
      slug: 'proces-d-assises-2016'
    }
    next();
  });

  router.post('/', mw.create);
  router.get('/:uid/agenda.json', mw.get);
  router.post('/:slug/edit', mw.set);
  router.post('/slugs/available', mw.slugs.available);
  router.post('/:slug/remove', [
    // mw.removeAgenda,
    (req, res) => {
      res.json({ redirectTo: '/' });
    }
  ]);

  router.post(
    '/:slug/keys/create',
    (req, res, next) => {
      req.identifiers = {
        type: 'agendaFullRead',
        identifier: req.agenda.uid
      };
      next();
    },
    keysMw.create(),
    (req, res) => res.send(req.result)
  );

  router.get(
    '/:slug/keys/get',
    (req, res, next) => {
      req.identifiers = {
        type: 'agendaFullRead',
        identifier: req.agenda.uid,
        key: req.query.key
      };
      next();
    },
    keysMw.get(),
    (req, res) => res.send(req.result)
  );

  router.get(
    '/:slug/keys/list',
    (req, res, next) => {
      req.identifiers = {
        type: 'agendaFullRead',
        identifier: req.agenda.uid
      };
      req.options = { total: true };
      next();
    },
    keysMw.list(),
    (req, res) => res.send(req.result)
  );

  router.patch(
    '/:slug/keys/update',
    (req, res, next) => {
      req.identifiers = {
        type: 'agendaFullRead',
        identifier: req.agenda.uid,
        key: req.query.key
      };
      next();
    },
    keysMw.update(),
    (req, res) => res.send(req.result)
  );

  router.delete(
    '/:slug/keys/remove',
    (req, res, next) => {
      req.identifiers = {
        type: 'agendaFullRead',
        identifier: req.agenda.uid,
        key: req.query.key
      };
      next();
    },
    keysMw.remove(),
    (req, res) => res.send({ rowAffected: req.result })
  );

  router.use(errorHandler({ log: true }));
};
