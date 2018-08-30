"use strict";

const locationRes = {
  index: '/locations',
  geocode: '/locations/geocode',
  set: '/locations',
  remove: '/locations/remove'
};

const redirects = {
  updated: '/?redirect.updated=:eventUid',
  seeEvent: '/?redirect.eventCreated=:eventUid',
  createOtherEvent: '/?redirect.createOtherEvent',
  seeAllEvents: '/?redirect.seeAllEvents',
  contactAdministrators: '/?redirect.contactAdministrators'
};

module.exports = [ {
  // we set the agenda base data to describe scenario guidelines
  agenda: {
    title: 'An agenda requiring no particular member data',
    description: 'When an agenda does not require member data to be input, the member step should not appear',
    slug: 'no-member-data-is-required',
    uid: 1234,
    id: 1,
  },
  config: {
    lang: 'fr',
    base: '/no-member-data-is-required/contribute',
    locationRes,
    redirects,
    member: {
      dataIsRequired: false
    },
    event: {
      message: 'Do not take **all day**'
    },
    confirmation: {
      message: 'This is a message written by *Agenda administrators*'
    }
  }
}, {
  agenda: {
    title: 'An agenda requiring event member data',
    description: 'When an agenda requires member data, the member step appears',
    slug: 'member-data-is-required',
    uid: 1235,
    id: 2
  },
  config: {
    lang: 'fr',
    base: '/member-data-is-required/contribute',
    locationRes,
    redirects,
    member: {
      dataIsRequired: true
    }
  }
}, {
  agenda: {
    title: 'A member set can be already loaded if the user is a member',
    description: 'If a user is a member but has incomplete data, he needs to complete his form',
    slug: 'member-with-incomplete-data',
    uid: 12345,
    id: 3
  },
  config: {
    lang: 'fr',
    base: '/member-with-incomplete-data/contribute',
    locationRes,
    redirects,
    member: {
      dataIsRequired: true,
    }
  },
  member: {
    name: 'Gaetan Latouche',
    phone: '+33 (0)6 50 91 00 12',
    email: null,
    position: null,
    organisation: 'OpenAgenda Corp.'
  }
}, {
  agenda: {
    title: 'Valid member data means the user can directly start with the event form',
    description: 'If a user is a member and his member data is valid, he can proceed with the event form',
    slug: 'member-with-complete-data',
    uid: 12347,
    id: 4
  },
  config: {
    lang: 'fr',
    base: '/member-with-complete-data/contribute',
    locationRes,
    redirects,
    member: {
      dataIsRequired: true
    }
  },
  member: {
    name: 'Gaetan Latouche',
    phone: '+33 (0)6 50 91 00 12',
    email: 'gaetan@cibul.net',
    position: 'Test user',
    organisation: 'OpenAgenda Corp.'
  }
}, {
  link: '/bypass-attempt-to-event/contribute/event',
  agenda: {
    title: 'User attempts to load event form when he is not a valid member',
    description: 'When mounted, the event app does the necessary checks and re-routes user to member form if required',
    slug: 'bypass-attempt-to-event',
    uid: 891391,
    id: 5
  },
  config: {
    lang: 'fr',
    base: '/bypass-attempt-to-event/contribute',
    locationRes,
    redirects,
    member: {
      dataIsRequired: true
    }
  },
  member: {} // nothing!
}, {
  link: '/confirmation/contribute/confirmation',
  agenda: {
    title: 'Show confirmation page directly (custom)',
    description: 'This is a shortcut page to a confirmation page with custom message',
    slug: 'confirmation',
    uid: 1234321,
    id: 6
  },
  config: {
    lang: 'fr',
    base: '/confirmation/contribute',
    locationRes,
    redirects,
    member: {
      dataIsRequired: true
    },
    confirmation: {
      message: 'This is a message from *Agenda administrators*'
    }
  }
}, {
  link: '/confirmation-default/contribute/confirmation',
  agenda: {
    title: 'Show confirmation page directly (default)',
    description: 'This is a shortcut page to a confirmation page with default message',
    slug: 'confirmation-default',
    uid: 1234321,
    id: 7
  },
  config: {
    lang: 'fr',
    base: '/confirmation-default/contribute',
    locationRes,
    redirects,
    member: {
      dataIsRequired: true
    }
  }
}, {
  link: '/edit-an-event/contribute/event/123',
  agenda: {
    title: 'Editing the event does not require a stepper',
    description: 'Yes.',
    slug: 'edit-an-event',
    uid: 121010301013,
    id: 8
  },
  config: {
    edit: true,
    lang: 'fr',
    base: '/edit-an-event/contribute',
    locationRes,
    redirects,
    member: {
      dataIsRequired: false
    }
  },
  event: {
    uid: 123,
    slug: 'an-existing-event',
    title: {
      fr: 'Un événement qui existe pour de vrai',
      en: 'An existing event for real'
    },
    description: {
      fr: 'Une petite description',
      en: 'A wee description'
    },
    locationUid: 50148047
  }
} ];
