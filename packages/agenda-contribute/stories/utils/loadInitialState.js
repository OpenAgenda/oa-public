export default function loadInitialState() {
  const memberFreshness = new Date();
  memberFreshness.setMonth(memberFreshness.getMonth() - 6);

  return {
    apiRoot: `http://localhost:${process.env.STORYBOOK_API_PORT}`,
    APIRoot: `http://localhost:${process.env.STORYBOOK_API_PORT}`,
    prefix: '/:agendaSlug/contribute',
    res: {
      member: '/api/me/agendas/:agendaUid',
      event: '/api/me/agendas/:agendaUid/events/:eventUid?detailed=1&useDateHoursMinutesFormat=1',
      eventContext: '/api/me/agendas/:agendaUid/events/:eventUid/context',
      requestContribute: '/:agendaSlug/request-contribute/conversation/create/thiswillbreakthestorybook',
      detailedSchema: '/api/agendas/:agendaUid', // ?detailed=1&includeNonDataFields=1',
      locations: {
        get: '/locations/:uid.json',
        index: '/api/agendas/:agendaUid/locations?itemsKey=items',
        create: '/agendas/:agendaUid/locations',
        geocode: '/locations/geocode',
        reverse: '/locations/geocode/reverse',
        insee: '/locations/insee',
        default: '/agendas/:agendaUid/locations',
      },
      references: '/api/agendas/:agendaUid/events',
      suggestions: '/agendas/:agendaUid/events/suggestions',
      suggestChangeRes: '/:agendaSlug/admin/events/:eventSlug/contact',
      showEvent: '#/agendas/:agendaUid/events/:eventUid',
      showMyEvents: '/home/events',
      contactAdministrators: '/agendas/:agendaUid/events/:eventUid/contact'
    },
    memberFreshness,
    files: {
      maxSize: 200000000,
      store: {
        type: 's3',
        bucket: 'cibul' // 'oadev'
      }
    },
    tiles: 'https://map.tiles'
  };
}
