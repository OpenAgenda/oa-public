'use strict';

const _ = require('lodash');
const imageWithPath = require('./imageWithPath');

module.exports = async ({ imagePath, defaultImage, getAgendaSummary }, agenda) => {
  const {
    upcomingPublishedEvents,
    publishedEvents,
    keywords,
    network
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
    image: imageWithPath(defaultImage, imagePath, agenda.image),
    hasUpcomingPublished: !!upcomingPublishedEvents,
    official: !!agenda.official,
    upcomingPublishedEvents,
    publishedEvents,
    keywords,
    ...(network ? { network } : {} )
  };
}
