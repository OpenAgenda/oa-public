"use strict";

module.exports = ( { event, req }, { start } ) => {

  const code = new Date( start ).getTime();

  return {
    link: `${event.link}/t/${code}${req.query.nc ? '?nc=' + req.query.nc : ''}`,
    permalink: `${event.permalink}/t/${code}${req.query.nc ? '?nc=' + req.query.nc : ''}`
  }

}
