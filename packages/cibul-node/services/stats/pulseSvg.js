import React from 'react';
import ReactDOMServer from 'react-dom/server';
import reactQuery from 'react-query';
import { subDays } from 'date-fns';
import PulseChart from '@openagenda/agenda-stats/components/PulseChart';

const { ReactQueryCacheProvider, makeQueryCache } = reactQuery;

const xmlHead = '<?xml version="1.0" encoding="UTF-8"?>';
const svgDoctype = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

export default function pulseSvg() {
  return async (req, res, next) => {
    try {
      const { core } = req.app.services;

      const { agendaUid } = req.params;
      const { height, width } = req.query;
      const queryCache = makeQueryCache();

      const now = new Date();
      const startOfPastYear = subDays(now, 364);

      const searchResult = await core.agendas(agendaUid).events.search(
        {
          updatedAt: {
            gte: startOfPastYear,
            lte: now,
          },
        },
        { size: 0 },
        {
          userUid: req.user.uid,
          aggregations: [
            {
              key: 'pulse',
              type: 'createdOrUpdatedAt',
              fixedInterval: '7d',
              extendedBounds: {
                min: startOfPastYear,
                max: now,
              },
            },
          ],
        },
      );

      const prefetchedData = searchResult
        && searchResult.aggregations
        && searchResult.aggregations.pulse;

      queryCache.setQueryData(
        ['AgendaStats.PulseChart', agendaUid],
        prefetchedData,
      );

      const element = React.createElement(
        ReactQueryCacheProvider,
        { queryCache },
        React.createElement(PulseChart, {
          agendaUid,
          height: parseInt(height, 10) || undefined,
          width: parseInt(width, 10) || undefined,
        }),
      );
      const result = ReactDOMServer.renderToStaticMarkup(element);

      res.data = result.replace(
        /^.*<svg([^>]*)>(.*)<\/svg>.*$/,
        `${xmlHead}\n${svgDoctype}\n<svg xmlns="http://www.w3.org/2000/svg"$1>$2</svg>`,
      );

      next();
    } catch (e) {
      next(e);
    }
  };
}
