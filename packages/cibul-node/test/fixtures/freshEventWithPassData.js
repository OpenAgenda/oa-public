const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(10);

const begin = new Date(tomorrow);

export default {
  title: 'Un event avec billetterie Pass',
  description: 'Test pass',
  timings: [
    {
      begin,
      end: new Date(tomorrow.setHours(tomorrow.getHours() + 2)),
    },
  ],
  location: {
    uid: 1234,
    city: 'Paris',
    latitude: 48.86696,
    longitude: 2.31014,
    postalCode: '75001',
    address: '182 Rue Saint-Honoré',
  },
  registration: [
    {
      type: 'link',
      value: null,
      service: 'passCulture',
      data: {
        venueId: 548,
        category: 'CINE_PLEIN_AIR',
        bookingContact: 'truc@email.com',
        priceCategories: [
          {
            id: 1,
            price: 12,
            label: 'Tarif normal',
          },
        ],
        dates: [
          {
            id: 2,
            timingId: begin.getTime(),
            priceCategoryId: 1,
            quantity: 300,
          },
        ],
      },
    },
  ],
};
