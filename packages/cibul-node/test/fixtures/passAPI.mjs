export default {
  datesPostResponse: {
    dates: [
      {
        bookingLimitDatetime: '2024-06-06T08:03:42.676000',
        bookedQuantity: 0,
        quantity: 300,
        id: 94015,
        beginningDatetime: '2024-06-06T08:03:42.676000',
        priceCategory: {
          id: 4569,
          label: 'Tarif normal',
          price: 12,
        },
      },
    ],
  },
  priceCategoriesPostResponse: {
    priceCategories: [
      {
        id: 4565,
        label: 'Tarif normal',
        price: 12,
      },
    ],
  },
  eventPostResponse: {
    priceCategories: [],
    id: 72585,
    accessibility: {
      audioDisabilityCompliant: false,
      mentalDisabilityCompliant: false,
      motorDisabilityCompliant: false,
      visualDisabilityCompliant: false,
    },
    bookingContact: null,
    bookingEmail: null,
    externalTicketOfficeUrl: null,
    image: null,
    enableDoubleBookings: false,
    location: {
      type: 'physical',
      venueId: 548,
    },
    name: 'Un event avec billetterie Pass',
    status: 'SOLD_OUT',
    itemCollectionDetails: null,
    categoryRelatedFields: {
      author: null,
      visa: null,
      stageDirector: null,
      category: 'CINE_PLEIN_AIR',
    },
    eventDuration: null,
    hasTicket: false,
  },
  offererVenuesGetResponse: [
    {
      offerer: {
        id: 262,
        createdDatetime: '2023-02-24T14:14:07.124623Z',
        name: 'OPEN AGENDA',
        siren: 809346158,
      },
      venues: [
        {
          createdDatetime: '2023-03-13T10:00:12.072329Z',
          id: 548,
          location: {
            address: '8 Rue Alice',
            city: 'Courbevoie',
            postalCode: 92400,
            type: 'physical',
          },
          legalName: 'OPEN AGENDA',
          publicName: 'Lieu Oa',
          siret: 80934615800011,
          activityDomain: 'OTHER',
          accessibility: {
            audioDisabilityCompliant: false,
            mentalDisabilityCompliant: false,
            motorDisabilityCompliant: false,
            visualDisabilityCompliant: false,
          },
        },
        {
          siretComment: test,
          createdDatetime: '2023-03-13T13:42:04.087730Z',
          id: 549,
          location: {
            address: 'Paris',
            city: 'Paris',
            postalCode: 75001,
            type: 'physical',
          },
          legalName: 'Some Location',
          publicName: 'Some Location',
          siret: null,
          activityDomain: 'OTHER',
          accessibility: {
            audioDisabilityCompliant: false,
            mentalDisabilityCompliant: false,
            motorDisabilityCompliant: false,
            visualDisabilityCompliant: false,
          },
        },
      ],
    },
  ],
  eventGetResponse: {
    priceCategories: [{ id: 4565, label: 'Tarif normal', price: 12 }],
    id: 72585,
    accessibility: {
      audioDisabilityCompliant: false,
      mentalDisabilityCompliant: false,
      motorDisabilityCompliant: false,
      visualDisabilityCompliant: false
    },
    bookingContact: null,
    bookingEmail: null,
    description: '',
    externalTicketOfficeUrl: null,
    image: null,
    enableDoubleBookings: false,
    location: { type: 'physical', venueId: 548 },
    name: 'Un event avec billetterie Pass',
    status: 'SOLD_OUT',
    itemCollectionDetails: null,
    categoryRelatedFields: {
      author: null,
      visa: null,
      stageDirector: null,
      category: 'CINE_PLEIN_AIR',
    },
    eventDuration: null,
    hasTicket: false,
  },
};
