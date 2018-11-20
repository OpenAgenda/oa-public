"use strict";

const _ = require( 'lodash' );

const defaultConfig = {
  lang: 'fr',
  locationRes: '/locations',
  referencesRes: '/refs',
  redirects: {
    updated: '/?redirect.updated=:eventUid',
    seeEvent: '/?redirect.eventCreated=:eventUid',
    createOtherEvent: '/?redirect.createOtherEvent',
    seeAllEvents: '/?redirect.seeAllEvents',
    contactAdministrators: '/?redirect.contactAdministrators',
    draft: '/?redirect.draft'
  },
  member: {
    dataIsRequired: true
  },
  fileStore: {
    type: 's3',
    bucket: 'oadev'
  }
}

const aValidMember = {
  name: 'Gaetan Latouche',
  phone: '+33 (0)6 50 91 00 12',
  email: 'gaetan@cibul.net',
  position: 'Test user',
  organisation: 'OpenAgenda Corp.'
}

module.exports = [ {
  // we set the agenda base data to describe scenario guidelines
  agenda: {
    title: 'An agenda requiring no particular member data',
    description: 'When an agenda does not require member data to be input, the member step should not appear',
    slug: 'no-member-data-is-required',
    uid: 1234,
    id: 1,
  },
  config: _.assign( {}, defaultConfig, {
    base: '/no-member-data-is-required/contribute',
    member: {
      dataIsRequired: false
    },
    event: {
      message: 'Do not take **all day**'
    },
    confirmation: {
      message: 'This is a message written by *Agenda administrators*'
    }
  } )
}, {
  agenda: {
    title: 'An agenda requiring event member data',
    description: 'When an agenda requires member data, the member step appears',
    slug: 'member-data-is-required',
    uid: 1235,
    id: 2
  },
  config: _.assign( {}, defaultConfig, {
    base: '/member-data-is-required/contribute',
    member: {
      dataIsRequired: true
    }
  } )
}, {
  agenda: {
    title: 'A member set can be already loaded if the user is a member',
    description: 'If a user is a member but has incomplete data, he needs to complete his form',
    slug: 'member-with-incomplete-data',
    uid: 12345,
    id: 3
  },
  config: _.assign( {}, defaultConfig, {
    base: '/member-with-incomplete-data/contribute'
  } ),
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
  config: _.assign( {}, defaultConfig, {
    base: '/member-with-complete-data/contribute',
  } ),
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
  config: _.assign( {}, defaultConfig, {
    base: '/bypass-attempt-to-event/contribute',
  } ),
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
  config: _.assign( {}, defaultConfig, {
    base: '/confirmation/contribute',
    confirmation: {
      message: 'This is a message from *Agenda administrators*'
    },
  } )
}, {
  link: '/confirmation-default/contribute/confirmation',
  agenda: {
    title: 'Show confirmation page directly (default)',
    description: 'This is a shortcut page to a confirmation page with default message',
    slug: 'confirmation-default',
    uid: 1234321,
    id: 7
  },
  config: _.assign( {}, defaultConfig, {
    base: '/confirmation-default/contribute'
  } )
}, {
  link: '/edit-an-event/contribute/event/123',
  agenda: {
    title: 'Editing the event does not require a stepper',
    description: 'Yes.',
    slug: 'edit-an-event',
    uid: 121010301013,
    id: 8
  },
  config: _.assign( {}, defaultConfig, {
    base: '/edit-an-event/contribute',
    edit: true,
    event: {
      message: '*Instructions appear in edition too*'
    }
  } ),
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
    location: { uid: 50148047 }
  }
}, {
  link: '/edit-a-draft-event/contribute/event/902/draft',
  agenda: {
    title: 'A draft event being edited can be saved as draft again',
    description: 'Yes.',
    slug: 'edit-a-draft-event',
    uid: 121010301013,
    id: 202020
  },
  config: _.assign( {}, defaultConfig, {
    base: '/edit-a-draft-event/contribute',
  } ),
  event: {
    uid: 902,
    draft: true,
    slug: 'an-existing-draft-event',
    title: {
      fr: 'Pas fini'
    },
    description: {
      fr: 'Une petite description'
    },
    location: { uid: 50148047 }
  },
  member: aValidMember
}, {
  link: '/edit-a-draft-event-without-member/contribute/event/903/draft',
  agenda: {
    title: 'An edited draft without member data requires member data first',
    description: 'Yes.',
    slug: 'edit-a-draft-event-without-member',
    uid: 121010301013,
    id: 202020
  },
  config: _.assign( {}, defaultConfig, {
    base: '/edit-a-draft-event-without-member/contribute',
  } ),
  event: {
    uid: 903,
    draft: true,
    slug: 'an-existing-draft-event',
    title: {
      fr: 'Pas tout à fait fini'
    },
    description: {
      fr: 'Une petite description'
    },
    location: { uid: 50148047 }
  },
  member: {
    phone: '+33 (0)6 50 91 00 12',
    organisation: 'OpenAgenda Corp.'
  }
}, {
  link: '/an-event-form-with-custom-fields/contribute/event',
  agenda: {
    title: 'A contribute app with custom fields',
    description: 'From the agenda and from a network of agendas',
    slug: 'an-event-form-with-custom-fields',
    uid: 193820139,
    id: 202021
  },
  config: _.assign( {}, defaultConfig, {
    base: '/an-event-form-with-custom-fields/contribute'
  } ),
  member: aValidMember,
  schemaExtensions: [ {
    fields: [ {
      fieldType: 'abstract',
      field: 'title',
      label: 'Le nom de l\'événement'
    }, {
      fieldType: 'abstract',
      field: 'description'
    }, {  
      fieldType: 'text',
      field: 'networkfield',
      label: 'Un champ de réseau',
      placeholder: 'Biiiim',
      max: 123456789,
      sub: 'Et ouais'
    }, {
      fieldType: 'abstract',
      field: 'references',
      suggest: true,
      related: [ 'title', 'networkfield' ],
      boost: {
        title: 20,
        networkfield: 10
      }
    } ]
  }, {
    fields: [ {
      fieldType: 'text',
      field: 'agendafield',
      label: 'Un champ d\'agenda',
      placeholder: 'Bim',
      max: 10,
      min: 2
    } ]
  } ]
} ];
