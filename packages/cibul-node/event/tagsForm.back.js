'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('tagsForm');
const agendaTags = require('@openagenda/agenda-tags');
const agendaCategories = require('@openagenda/agenda-categories');
const cmn = require('../lib/commons-app');

const legacyEventSvc = require('../services/event');
const agendaSvc = require('../services/agenda')

module.exports = app => {

  const {
    agendas,
    core,
    legacy,
    sessions,
    members
  } = app.services;

  const preMw = [
    legacyEventSvc.mw.load('eventSlug', 'slug'),
    sessions.mw.loadOrRedirect(),
    members.mw.loadAndAuthorize('moderator')
  ];

  app.get(
    '/:slug/events/:eventSlug/tagcat',
    agendaSvc.mw.load('slug', { basicLoad: true, cache: true }),
    preMw,
    _loadTagSet,
    _loadTags,
    _loadCategorySet,
    _loadCategory,
    _loadCustomSet,
    _loadCustom,
    xhrGet,
    legacyEventSvc.mw.format,
    cmn.loadBaseData(legacyEventSvc.mw.layoutData, 'oasfmain.css'),
    page
 );

  app.post(
    '/:slug/events/:eventSlug/tagcat',
    agendas.mw.loadBy({ path: 'params.slug', field: 'slug' }),
    preMw,
    _loadTagSet,
    _loadCategorySet,
    (req, res, next) => {
      core.agendas(req.agenda.uid).settings.schema.getMerged({
        includeEvent: false,
        access: members.utils.getRoleSlug(req.member.role)
      }).then(schema => {
        req.schema = schema;
        next();
      }, next);
    },
    (req, res, next) => {

      const additionalFieldData = legacy.tagsAndCustom.utils.legacyToFormSchemaDataTransform({
        schema: req.schema,
        tagSet: req.tagSet,
        customSet: req.agenda.legacyStore.customFields
      }, req.body);
      core.agendas(req.agenda.uid).events.patch(req.event.uid, additionalFieldData, {
        context: {
          userUid: req.user.uid
        },
        access: members.utils.getRoleSlug(req.member.role)
      }).then(result => {
        res.json({ success: true });
      }, err => {
        log('error', err);
        res.json({ success: false });
      });
    }
 );

};


function _loadTags(req, res, next) {

  req.event.getAgendaTags((err, tags) => {

    if (err) return next(err);

    req.agendaTags = tags;

    next();

  });

}


function _loadCustomSet(req, res, next) {

  req.customSet = req.agenda.getCustomFieldsConfig();

  next();

}

function _loadCustom(req, res, next) {

  req.agenda.getEventPublicCustomData(req.event, (err, customFields) => {

    if (err) return next(err);

    req.agendaCustom = {};

    if (!_.isArray(customFields)) return next();

    req.agendaCustom = customFields.reduce((carry, c) => {

      carry[c.name] = c.value;

      return carry;

    }, {});

    next();

  });

}


function _loadCategory(req, res, next) {

  req.event.getAgendaCategory((err, category) => {

    if (err) return next(err);

    req.agendaCategory = category;

    next();

  });

}


function _loadTagSet(req, res, next) {

  agendaTags.get(req.agenda.id, (err, tagSet) => {

    if (err) return next(err);

    req.tagSet = tagSet;

    next();

  });

}


function _loadCategorySet(req, res, next) {

  agendaCategories.get(req.agenda.id, (err, categorySet) => {

    if (err) return next(err);

    req.categorySet = categorySet;

    next();

  });

}


function page(req, res) {

  cmn.render(req, res, 'eventFormTags/index', {
    agenda: req.agenda,
    scriptParams: {
      lang: req.lang,
      redirect: req.query.redirect || `/agendas/${req.agenda.uid}/events/${req.event.uid}`
    }
  });

}


function xhrGet(req, res, next) {
  if (!req.xhr) return next();

  res.json({
    event: {
      title: req.event.title,
      tags: req.agendaTags,
      category: req.agendaCategory,
      custom: req.agendaCustom,
    },
    languages: req.event.getLanguages(),
    categorySet: req.categorySet,
    tagSet: req.tagSet,
    customSet: req.customSet
  });
}
