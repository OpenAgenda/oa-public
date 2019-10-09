'use strict';

module.exports = (locals, event) => {
  event.link = `${locals.root}/events/${event.slug}`;
  event.permalink = `${locals.root}/permalinks/events/${event.uid}`;

  const encodedLink = encodeURIComponent(event.permalink);

  event.share = {
    facebook: `https://www.facebook.com/sharer.php?u=${encodedLink}`,
    twitter: `https://twitter.com/share?url=${encodedLink}&text=${event.title}`,
    email: `https://openagenda.com/${locals.agenda.slug}/events/${event.slug}/action?lang=${locals.lang}&action=email`,
    permalink: event.permalink
  };

  return event;
};
