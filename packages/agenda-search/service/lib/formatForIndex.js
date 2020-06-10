'use strict';

const _ = require('lodash');

module.exports = ({ imagePath, defaultImage }, agenda) => ({
  ..._.pick(agenda, [
    'id',
    'uid',
    'slug',
    'title',
    'description',
    'image',
    'publishedEvents',
    'upcomingPublishedEvents',
    'keywords',
    'officializedAt',
    'updatedAt',
    'createdAt'
  ]),
  image: agenda.image ? imagePath + agenda.image : defaultImage,
  hasUpcomingPublished: !!agenda.upcomingPublishedEvents,
  official: !!agenda.official
});
