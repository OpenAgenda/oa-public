"use strict";

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
    member: {
      dataIsRequired: false
    },
    event: {
      instruction: 'Do not take **all day**'
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
} ];