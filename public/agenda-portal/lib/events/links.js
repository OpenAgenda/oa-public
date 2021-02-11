'use strict';

module.exports = (locals, event) => {
  const {
    lang
  } = locals;
  const langNotDefault = locals.defaultLang !== lang;

  event.link = `${locals.root}/events/${event.slug}${langNotDefault ? `?lang=${lang}` : ''}`;
  event.permalink = `${locals.root}/permalinks/events/${event.uid}${langNotDefault ? `?lang=${lang}` : ''}`;

  const encodedLink = encodeURIComponent(event.permalink);

  event.share = {
    facebook: `https://www.facebook.com/sharer.php?u=${encodedLink}${langNotDefault ? `&lang=${lang}` : ''}`,
    twitter: `https://twitter.com/share?url=${encodedLink}&text=${event.title}${langNotDefault ? `&lang=${lang}` : ''}`,
    email: `https://openagenda.com/${locals.agenda.slug}/events/${event.slug}/action?lang=${locals.lang}&action=email${langNotDefault ? `&lang=${lang}` : ''}`,
    permalink: event.permalink
  };

  return event;
};
