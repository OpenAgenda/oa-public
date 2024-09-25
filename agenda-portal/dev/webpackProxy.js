'use strict';

const { createProxyServer } = require('http-proxy');

module.exports = function webpackProxy(app, devServerPort) {
  const httpProxy = createProxyServer({ secure: false }).on(
    'error',
    (error, req, res) => {
      if (error.code !== 'ECONNRESET') {
        console.error('proxy error', error);
      }
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'application/json' });
      }

      const json = {
        error: 'proxy_error',
        reason: error.message,
      };
      res.end(JSON.stringify(json));
    },
  );

  app.get(['/ws', '/dist/main.js', '/dist/main.css'], (req, res) =>
    httpProxy.web(req, res, {
      target: `http://localhost:${devServerPort}`,
      ws: true,
    }));
};
