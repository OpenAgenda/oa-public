import fs from 'node:fs';
import async from 'async';
import parserLib from '@openagenda/tumblr-parser';
import * as mwh from '../lib/middlewareHelpers.js';

const tblr = {
  eventItem: fs
    .readFileSync(`${import.meta.dirname}/templates/eventItem.tblr`)
    .toString(),
  eventItemMapping: JSON.parse(
    fs
      .readFileSync(`${import.meta.dirname}/templates/eventItem.map.json`)
      .toString(),
  ),
  event: fs
    .readFileSync(`${import.meta.dirname}/templates/event.tblr`)
    .toString(),
  eventMapping: JSON.parse(
    fs
      .readFileSync(`${import.meta.dirname}/templates/event.map.json`)
      .toString(),
  ),
  header: fs
    .readFileSync(`${import.meta.dirname}/templates/header.tblr`)
    .toString(),
  headerMapping: JSON.parse(
    fs
      .readFileSync(`${import.meta.dirname}/templates/header.map.json`)
      .toString(),
  ),
};

function loadEmbed(embedService, paramName, fieldName) {
  return (req, res, next) => {
    const getParams = {};

    getParams[fieldName] = req.params[paramName];

    embedService.get(getParams, (err, e) => {
      if (err) {
        return next({
          code: 404,
          message: `embed configuration not found for embed ${req.params[paramName]}`,
        });
      }

      req.embed = e;

      next();
    });
  };
}

function loadCustomLayoutData(req, res, next) {
  const customCss = req.embed.getCustomCss();

  const linkCss = req.embed.getLinkCss();

  const useDefaultCss = req.embed.getUseDefaultCss();

  const layoutMode = req.embed.getLayoutMode();

  const modes = {
    standard: 'oae.css',
    tiled: 'oaet.css',
    cascading: 'oaet.css',
    nocss: false,
  };

  if (!useDefaultCss.list || layoutMode === 'nocss') {
    delete req.baseData.head.css.main;
  }

  req.baseData.layoutMode = layoutMode;

  if (linkCss) {
    req.baseData.head.css.embedLink = linkCss;
  }

  if (customCss) {
    req.baseData.customCss = customCss;
  }

  req.baseData.head.customHead = req.embed.getHead();

  if (layoutMode === false) {
    req.baseData.scriptParams.cascading = req.embed.getCascadingMode();
  } else {
    req.baseData.scriptParams.cascading = layoutMode === 'cascading';
  }

  if (modes[layoutMode]) {
    req.baseData.head.css.main = `/css/${modes[layoutMode]}`;
  }

  next();
}

function browserCacheControlData(req, res, next) {
  req.agenda.getControlDataTimestamp((err, lastUpdate) => {
    if (err) return next(err);

    const since = req.embed.updatedAt > lastUpdate ? req.embedUpdatedAt : lastUpdate;

    mwh.compareModifiedSince(since, req, res, next);
  });
}

function _setActiveShares(formatted, embed) {
  const map = {
    fb: 'facebookShare',
    tw: 'twitterShare',
    gp: 'googleShare',
    li: 'linkedInShare',
    tu: 'tumblrShare',
    pi: 'pinterestShare',
  };

  const shares = embed.getShares();

  for (const i in map) {
    if (!shares[i]) {
      formatted[map[i]] = false;
    }
  }
}

function _hasQueryOtherThan(req, exceptions) {
  const exceptionList = typeof exceptions === 'string' ? [exceptions] : exceptions || [];

  for (const q in req.query) {
    if (!exceptionList.includes(q)) return true;
  }

  return false;
}

function _getCustomFields(req, e, mapping, cb) {
  if (!req.embed || !req.embed.getMapping(mapping)) return cb(null, {});

  if (!req.agenda) return cb(null, {});

  // this call works for unconfigured custom fields. Used by MCC 2015 agendas. Need to be
  // deprecated to use getEventPublicCustomData only ( or any single source of structured event data )

  e.getCustomFields(req.lang, false, (err, eventCustomFields) => {
    if (err) return cb(err);

    req.agenda.getEventPublicCustomData(e, req.lang, (err2, custom) => {
      if (err2) return cb(err);

      custom.forEach((c) => {
        eventCustomFields[c.name] = c.label;
      });

      cb(null, eventCustomFields);
    });
  });
}

function _flattenArrays(values) {
  for (const k in values) {
    if (Array.isArray(values[k])) values[k] = values[k].join(', ');
  }
}

function browserCache(req, res, next) {
  let lastUpdate = req.agenda.updatedAt;

  if (req.embed.updatedAt > lastUpdate) {
    lastUpdate = req.embed.updatedAt;
  }

  if (_hasQueryOtherThan(req, 'callback')) {
    return next();
  }

  mwh.compareModifiedSince(lastUpdate, req, res, next);
}

/**
 * render content of embed list,
 * shove result in req.embed.renders.list
 */

function renderEventItems(req, res, next) {
  let template = tblr.eventItem;
  let mapping = tblr.eventItemMapping;

  if (req.embed) {
    mapping = req.embed.getMapping('eventitem') || mapping;

    template = req.embed.getTemplate('eventitem') || template;
  }

  if (!req.renders) req.renders = {};

  req.renders.eventItems = [];

  const eventItemParser = parserLib(mapping);

  eventItemParser.load(template);

  async.eachSeries(
    req.events,
    (e, ecb) => {
      _getCustomFields(req, e, 'eventitem', (err, values) => {
        if (err) {
          req.log.error(
            'could not retrieve custom data of event %s: %s',
            e.id,
            err,
          );
        } else {
          req.renders.eventItems.push(
            eventItemParser.render(Object.assign(e, values)),
          );
        }

        ecb();
      });
    },
    next,
  );
}

function renderHeader(req, res, next) {
  let mapping = tblr.headerMapping;

  let template = tblr.header;

  if (req.embed) {
    mapping = req.embed.getMapping('header') || mapping;

    template = req.embed.getTemplate('header') || template;
  }

  const parser = parserLib(mapping);

  parser.load(template);

  req.renders.header = parser.render({
    actionLink: req.actionLink.url,
    actionLabel: req.actionLink.label,
    lang: req.lang,
  });

  next();
}

function renderEvent(req, res, next) {
  let mapping = tblr.eventMapping;

  let template = tblr.event;

  if (req.embed) {
    mapping = req.embed.getMapping('event') || mapping;

    template = req.embed.getTemplate('event') || template;

    _setActiveShares(req.formatted, req.embed);
  }

  const eventParser = parserLib(mapping);

  eventParser.load(template);

  _getCustomFields(req, req.event, 'event', (err, values) => {
    if (err) return next(err);

    _flattenArrays(values);

    Object.assign(req.formatted, values);

    req.render = eventParser.render(req.formatted);

    next();
  });
}

export default (embedService) => ({
  load: loadEmbed.bind(null, embedService),
  loadCustomLayoutData,
  renderHeader,
  renderEventItems,
  renderEvent,
  browserCache,
  browserCacheControlData,
});
