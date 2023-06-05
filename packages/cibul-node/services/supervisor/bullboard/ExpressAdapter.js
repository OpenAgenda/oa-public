// from https://github.com/felixmosh/bull-board/blob/master/packages/express/src/ExpressAdapter.ts

'use strict';

const path = require('path');
const ejs = require('ejs');
const express = require('express');

const wrapAsync = fn => async (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = class ExpressAdapter {
  constructor() {
    this.app = express();
    this.basePath = '';
    this.viewPath = '';
    this.uiConfig = {};
  }

  setBasePath(basePath) {
    this.basePath = basePath;
    return this;
  }

  setStaticPath(staticsRoute, staticsPath) {
    this.app.use(staticsRoute, express.static(staticsPath));
    return this;
  }

  setViewsPath(viewPath) {
    this.viewPath = viewPath;
    return this;
  }

  setErrorHandler(handler) {
    this.errorHandler = handler;
    return this;
  }

  setApiRoutes(routes) {
    if (!this.errorHandler) {
      throw new Error('Please call \'setErrorHandler\' before using \'registerPlugin\'');
    } else if (!this.bullBoardQueues) {
      throw new Error('Please call \'setQueues\' before using \'registerPlugin\'');
    }
    const router = express.Router();

    routes.forEach(route =>
      (Array.isArray(route.method) ? route.method : [route.method]).forEach(
        method => {
          router[method](
            route.route,
            wrapAsync(async (req, res) => {
              const response = await route.handler({
                queues: this.bullBoardQueues,
                query: req.query,
                params: req.params,
              });

              res.status(response.status || 200).json(response.body);
            }),
          );
        },
      ));

    router.use((err, _req, res, next) => {
      if (!this.errorHandler) {
        return next();
      }

      const response = this.errorHandler(err);
      return res.status(response.status).send(response.body);
    });

    this.app.use(router);
    return this;
  }

  setEntryRoute(routeDef) {
    const { name } = routeDef.handler();

    const viewHandler = (_req, res, next) => {
      const basePath = this.basePath.endsWith('/') ? this.basePath : `${this.basePath}/`;
      const uiConfig = JSON.stringify(this.uiConfig)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e');

      ejs.renderFile(path.join(this.viewPath, name), {
        basePath,
        uiConfig,
      }, (err, renderedHtml) => {
        if (err) {
          next(err);
        } else {
          res.send(renderedHtml);
        }
      });
    };

    this.app[routeDef.method](routeDef.route, viewHandler);
    return this;
  }

  setQueues(bullBoardQueues) {
    this.bullBoardQueues = bullBoardQueues;
    return this;
  }

  setUIConfig(config = {}) {
    this.uiConfig = config;
    return this;
  }

  getRouter() {
    return this.app;
  }
};
