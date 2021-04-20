'use strict';

const _ = require('lodash');
const imageWithPath = require('./imageWithPath');
const log = require('@openagenda/logs')('formatForIndex');

module.exports = async ({ imagePath, defaultImage, getAgendaSummary }, agenda) => {
  const {
    upcomingPublishedEvents,
    publishedEvents,
    recentlyContributedEvents,
    eventCountsByState,
    keywords,
    network,
    locationSet
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
      'settings',
      'updatedAt',
      'createdAt'
    ]),
    image: imageWithPath(defaultImage, imagePath, agenda.image),
    hasUpcomingPublished: !!upcomingPublishedEvents,
    official: !!agenda.official,
    upcomingPublishedEvents,
    publishedEvents,
    eventCountsByState,
    recentlyContributedEvents,
    keywords,
    ...(network ? { network } : {} ),
    ...(locationSet ? { locationSet } : {})
  };
}
