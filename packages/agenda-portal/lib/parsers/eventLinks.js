"use strict";

const _ = require( 'lodash' );

module.exports = ( event, { lang, res, req, index } ) => {

  event.link = `${res.locals.root}/events/${event.slug}`;
  event.permalink = `${res.locals.root}/permalinks/events/${event.uid}`;

  const encodedLink = encodeURIComponent( event.permalink );

  event.share = {
    facebook: `https://www.facebook.com/sharer.php?u=${encodedLink}`,
    twitter: `https://twitter.com/share?url=${encodedLink}&text=${event.title}`,
    email: `https://openagenda.com/${res.locals.agenda.slug}/events/${event.slug}/action?lang=${lang}&action=email`,
    permalink: event.permalink
  }

  return event;

}
