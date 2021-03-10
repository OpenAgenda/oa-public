const fs = require('fs');

const reduceBy = require('../server/lib/reduceBy');

const reduceByDeep = require('../server/lib/reduceByDeep');

const items = [
  {
    title: 'one',
    location: {
      name: 'Gaité Lyrique',
      city: 'Paris',
      region: 'Ile de France',
      country: 'France',
    },
    tagGroups: [
      {
        name: "Type d'événement",
        access: 'public',
        slug: 'type-devenement',
        tags: [
          {
            label: 'Exposition',
            slug: 'exposition',
          },
          {
            label: 'Concert',
            slug: 'concert',
          },
        ],
      },
    ],
  },
  {
    title: 'two',
    location: {
      name: 'Le Select',
      city: 'Paris',
      region: 'Ile de France',
      country: 'France',
    },
    tagGroups: [
      {
        name: "Type d'événement",
        access: 'public',
        slug: 'type-devenement',
        tags: [
          {
            label: 'Exposition',
            slug: 'exposition',
          },
          {
            label: 'Sortie',
            slug: 'Sortie',
          },
        ],
      },
    ],
  },
  {
    title: 'three',
    location: {
      name: 'Chez Papy',
      city: 'Paris',
      region: 'Ile de France',
      country: 'France',
    },
    tagGroups: [
      {
        name: "Type d'événement",
        access: 'public',
        slug: 'type-devenement',
        tags: [
          {
            label: 'Concert',
            slug: 'concert',
          },
          {
            label: 'Sortie',
            slug: 'Sortie',
          },
        ],
      },
    ],
  },
  {
    title: 'four',
    location: {
      name: "L'Ossuaire de Douaumont",
      city: 'Verdun',
      region: 'Grand-Est',
      country: 'France',
    },
    tagGroups: [
      {
        name: "Type d'événement",
        access: 'public',
        slug: 'type-devenement',
        tags: [
          {
            label: 'Exposition',
            slug: 'exposition',
          },
          {
            label: 'Sortie',
            slug: 'Sortie',
          },
        ],
      },
    ],
  },
];

describe('unit - reduceBy', () => {
  test('shallow', () => {
    const reducer = {
      targetKey: 'locationName',
      sortBy: 'locationName',
      hoist: [
        {
          source: 'location.city',
          target: 'city',
        },
      ],
    };

    const reduced = reduceBy(items, 'location.name', reducer);

    expect(reduced).toEqual(
      JSON.parse(fs.readFileSync(`${__dirname}/data/reduced.json`, 'utf-8'))
    );
  });

  test('deep', () => {
    const reducer = [
      {
        childrenKey: 'regions',
      },
      {
        key: 'location.region',
        targetKey: 'region',
        sortBy: 'region',
        childrenKey: 'cities',
        hoist: [
          {
            source: 'location.country',
            target: 'country',
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
            source: 'location.region',
            target: 'region',
          },
        ],
      },
      {
        key: 'location.name',
        targetKey: 'locationName',
        sortBy: 'locationName',
        childrenKey: 'events',
        hoist: [
          {
            source: 'location.city',
            target: 'city',
          },
        ],
      },
    ];

    const reduced = reduceByDeep(items, reducer);

    expect(reduced).toEqual(
      JSON.parse(
        fs.readFileSync(`${__dirname}/data/reduced.deep.json`, 'utf-8')
      )
    );
  });

  test('multiple values', () => {
    const reducer = {
      targetKey: 'typeEvenement',
      sortBy: 'typeEvenement',
    };

    const reduced = reduceBy(
      items,
      'tagGroups[name="Type d\'événement"].tags[].label',
      reducer
    );

    expect(reduced).toEqual(
      JSON.parse(
        fs.readFileSync(`${__dirname}/data/reduced.multiple.json`, 'utf-8')
      )
    );
  });

  test('multiple deep values', () => {
    const reducer = [
      {
        childrenKey: 'eventTypes',
      },
      {
        key: 'tagGroups[slug="type-devenement"].tags[].label',
        targetKey: 'typeEvenement',
        sortBy: 'typeEvenement',
        childrenKey: 'regions',
      },
      {
        key: 'location.region',
        targetKey: 'region',
        sortBy: 'region',
        childrenKey: 'cities',
        hoist: [
          {
            source: 'location.country',
            target: 'country',
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
            source: 'location.region',
            target: 'region',
          },
        ],
      },
      {
        key: 'location.name',
        targetKey: 'locationName',
        sortBy: 'locationName',
        childrenKey: 'events',
        hoist: [
          {
            source: 'location.city',
            target: 'city',
          },
        ],
      },
    ];

    const reduced = reduceByDeep(items, reducer);

    expect(reduced).toEqual(
      JSON.parse(
        fs.readFileSync(`${__dirname}/data/reduced.multiple-deep.json`, 'utf-8')
      )
    );
  });
});
