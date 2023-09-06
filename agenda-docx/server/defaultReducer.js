'use strict';

module.exports = [
  {
    childrenKey: 'regions',
  },
  {
    key: 'location.region',
    targetKey: 'region',
    sortBy: 'region',
    childrenKey: 'departments',
    hoist: [
      {
        source: 'location.country',
        target: 'country',
      },
    ],
  },
  {
    key: 'location.department',
    targetKey: 'department',
    sortBy: 'department',
    childrenKey: 'cities',
    hoist: [
      {
        source: 'location.region',
        target: 'region',
      },
    ],
  },
  {
    key: 'location.city',
    targetKey: 'city',
    sortBy: 'city',
    childrenKey: 'locations',
    hoist: [
      {
        source: 'location.department',
        target: 'department',
      },
      {
        source: 'location.region',
        target: 'region',
      },
    ],
  },
  {
    key: 'location.name',
    targetKey: 'location',
    sortBy: 'location',
    childrenKey: 'events',
    sortChildrenBy: 'title',
    hoist: [
      {
        source: 'location.address',
        target: 'address',
      },
      {
        source: 'location.description',
        target: 'description',
      },
      {
        source: 'location.access',
        target: 'access',
      },
      {
        source: 'location.tags',
        target: 'tags',
      },
      {
        source: 'location.phone',
        target: 'phone',
      },
      {
        source: 'location.website',
        target: 'website',
      },
    ],
  },
];
