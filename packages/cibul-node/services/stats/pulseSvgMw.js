const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { ReactQueryCacheProvider, makeQueryCache } = require('react-query');
const { subDays } = require('date-fns');
const PulseChart = require('@openagenda/agenda-stats/dist/components/PulseChart');

module.exports = function pulseSvgMw() {
  return async (req, res, next) => {
    try {
      const { core } = req.app.services;

      const agendaUid = req.params.agendaUid;
      const { height, width } = req.query;
      const queryCache = makeQueryCache();

      const now = new Date();
      const startOfPastYear = subDays(now, 364);

      const searchResult = await core
        .agendas(agendaUid)
        .events.search({
          updatedAt: {
            gte: startOfPastYear,
            lte: now
          }
        }, { size: 0 }, {
          aggregations: [
            {
              key: 'pulse',
              type: 'createdOrUpdatedAt',
              fixedInterval: '7d',
              extendedBounds: {
                min: startOfPastYear,
                max: now
              }
            }
          ]
        });

      const prefetchedData = searchResult && searchResult.aggregations && searchResult.aggregations.pulse;

      queryCache.setQueryData(['AgendaStats.PulseChart', agendaUid], prefetchedData);

      const element = React.createElement(
        ReactQueryCacheProvider,
        { queryCache },
        React.createElement(
          PulseChart,
          {
            agendaUid,
            height: Number.parseInt(height) || undefined,
            width: Number.parseInt(width) || undefined
          }
        )
      );
      const result = ReactDOMServer.renderToStaticMarkup(element);
      const svgXml = result.replace(/<svg([^>]*)>(.*)<\/svg>/, '<svg$1 xmlns="http://www.w3.org/2000/svg">$2</svg>');

      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svgXml);
    } catch (e) {
      if (e.name === 'NotFoundError') {
        res.sendStatus(404);
        return;
      }

      next(e);
    }
  };
}
