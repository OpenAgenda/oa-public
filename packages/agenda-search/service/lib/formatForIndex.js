'use strict';

const _ = require('lodash');

module.exports = async ({ imagePath, defaultImage, getAgendaSummary }, agenda) => {
  const {
    upcomingPublishedEvents,
    publishedEvents,
    keywords
  } = await getAgendaSummary(agenda);

  return {
    ..._.pick(agenda, [
      'id',
      'uid',
      'slug',
      'title',
      'description',
      'image',
      'keywords',
      'officializedAt',
      'updatedAt',
      'createdAt'
    ]),
    image: agenda.image ? imagePath + agenda.image : defaultImage,
    hasUpcomingPublished: !!upcomingPublishedEvents,
    official: !!agenda.official,
    upcomingPublishedEvents,
    publishedEvents,
    keywords
  };
}
