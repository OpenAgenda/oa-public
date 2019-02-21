"use strict";

const _ = require( 'lodash' );
const navigation = require( '../navigation' );

module.exports = ( event, { lang, root, agenda, req } ) => {

  const nav = req ? navigation.listQuery( req ) : null;

  event.link = `${root}/events/${event.slug}${nav ? '?' + nav : '' }`;
  event.permalink = `${root}/permalinks/events/${event.uid}`;

  const encodedLink = encodeURIComponent( event.permalink );

  event.share = {
    facebook: `https://www.facebook.com/sharer.php?u=${encodedLink}`,
    twitter: `https://twitter.com/share?url=${encodedLink}&text=${event.title}`,
    email: `https://openagenda.com/${agenda.slug}/events/${event.slug}/action?lang=${lang}&action=email`,
    permalink: event.permalink
  }

  return event;

}
