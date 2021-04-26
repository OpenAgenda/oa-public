'use strict';

const { produce } = require('immer');

module.exports = produce(agenda => {
  agenda._hasUpcomingEvents = (agenda.summary?.publishedEvents?.current || 0) + (agenda.summary?.publishedEvents.upcoming || 0) > 0
  agenda._recentlyAddedEvents = !!Object.keys(
    agenda.summary?.recentlyAddedEvents || {}
  ).filter(key => !!agenda.summary?.recentlyAddedEvents[key]).length;
  agenda.official = !!agenda.official;
  agenda.indexed = !!agenda.indexed;
  agenda.slug = agenda.slug || null;
});