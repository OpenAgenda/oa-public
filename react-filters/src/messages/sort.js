import { defineMessages } from 'react-intl/server';

export default defineMessages({
  // accessible name of the select
  sortBy: {
    id: 'ReactFilters.Sort.sortBy',
    defaultMessage: 'Sort by',
  },
  relevance: {
    id: 'ReactFilters.Sort.relevance',
    defaultMessage: 'Relevance',
  },
  chronological: {
    id: 'ReactFilters.Sort.chronological',
    defaultMessage: 'Chronological order',
  },
  featuredThenChronological: {
    id: 'ReactFilters.Sort.featuredThenChronological',
    defaultMessage: 'Featured first, chronological',
  },
  lastDate: {
    id: 'ReactFilters.Sort.lastDate',
    defaultMessage: 'Chronological (last date)',
  },
  featuredThenLastDate: {
    id: 'ReactFilters.Sort.featuredThenLastDate',
    defaultMessage: 'Featured first, chronological (last date)',
  },
  recentlyUpdated: {
    id: 'ReactFilters.Sort.recentlyUpdated',
    defaultMessage: 'Recently updated',
  },
  leastRecentlyUpdated: {
    id: 'ReactFilters.Sort.leastRecentlyUpdated',
    defaultMessage: 'Least recently updated',
  },
  relevanceDescription: {
    id: 'ReactFilters.Sort.relevanceDescription',
    defaultMessage: 'Best matches for the search first',
  },
  chronologicalDescription: {
    id: 'ReactFilters.Sort.chronologicalDescription',
    defaultMessage: 'Next dates first',
  },
  featuredThenChronologicalDescription: {
    id: 'ReactFilters.Sort.featuredThenChronologicalDescription',
    defaultMessage: 'Featured events first, then by next date',
  },
  lastDateDescription: {
    id: 'ReactFilters.Sort.lastDateDescription',
    defaultMessage: 'By the last date of each event',
  },
  featuredThenLastDateDescription: {
    id: 'ReactFilters.Sort.featuredThenLastDateDescription',
    defaultMessage:
      'Featured events first, then by the last date of each event',
  },
  recentlyUpdatedDescription: {
    id: 'ReactFilters.Sort.recentlyUpdatedDescription',
    defaultMessage: 'Last modified events first',
  },
  leastRecentlyUpdatedDescription: {
    id: 'ReactFilters.Sort.leastRecentlyUpdatedDescription',
    defaultMessage: 'Least recently modified events first',
  },
  chronologicalShort: {
    id: 'ReactFilters.Sort.chronologicalShort',
    defaultMessage: 'Chronological',
  },
  leastRecentlyUpdatedShort: {
    id: 'ReactFilters.Sort.leastRecentlyUpdatedShort',
    defaultMessage: 'Oldest updates',
  },
  // how the agenda admin names the order its public view uses by default
  publicView: {
    id: 'ReactFilters.Sort.publicView',
    defaultMessage: 'Public view',
  },
});
