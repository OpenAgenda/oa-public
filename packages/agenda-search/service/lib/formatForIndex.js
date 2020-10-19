'use strict';

const _ = require('lodash');
const imageWithPath = require('./imageWithPath');
const log = require('@openagenda/logs')('formatForIndex');

module.exports = async ({ imagePath, defaultImage, getAgendaSummary }, agenda) => {
  const {
    upcomingPublishedEvents,
    publishedEvents,
    recentlyContributedEvents,
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
    recentlyContributedEvents,
    keywords,
    ...(network ? { network } : {} )
  };
}
