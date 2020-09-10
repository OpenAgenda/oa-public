const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { ReactQueryCacheProvider, makeQueryCache } = require('react-query');
const { subDays } = require('date-fns');
const PulseChart = require('@openagenda/agenda-stats/dist/components/PulseChart');

const xmlHead = '<?xml version="1.0" encoding="UTF-8"?>';
const svgDoctype = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

module.exports = function pulseSvg() {
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

      res.data = result
        .replace(
          /^.*<svg([^>]*)>(.*)<\/svg>.*$/,
          `${xmlHead}\n${svgDoctype}\n<svg xmlns="http://www.w3.org/2000/svg"$1>$2</svg>`
        );

      next();
    } catch (e) {
      next(e);
    }
  };
}
