'use strict';

const getBeginValue = require('./begin').getValue;

module.exports = ({ event, req }, timing) => {
  const begin = getBeginValue(timing);
  const code = new Date(begin).getTime();

  return {
    link: `${event.link}/t/${code}${req.query.nc ? `?nc=${req.query.nc}` : ''}`,
    permalink: `${event.permalink}/t/${code}${
      req.query.nc ? `?nc=${req.query.nc}` : ''
    }`
  };
};
