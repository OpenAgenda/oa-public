import { getValue as getBeginValue } from './begin.js';

export default ({ event, req }, timing) => {
  const begin = getBeginValue(timing);
  const code = new Date(begin).getTime();

  return {
    link: `${event.link}/t/${code}${req?.query.nc ? `?nc=${req.query.nc}` : ''}`,
    permalink: `${event.permalink}/t/${code}${
      req?.query.nc ? `?nc=${req.query.nc}` : ''
    }`,
  };
};
