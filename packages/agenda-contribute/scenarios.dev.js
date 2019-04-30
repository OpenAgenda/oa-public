"use strict";

const _ = require( 'lodash' );

const defaultConfig = {
  base: null, // required. base route for app.
  lang: 'fr',
  locationRes: '/locations',
  referencesRes: '/refs',
  redirects: {
    updated: '/?redirect.updated=:eventUid',
    seeEvent: '/?redirect.eventCreated=:eventUid',
    createOtherEvent: '/?redirect.createOtherEvent',
    seeAllEvents: '/?redirect.seeAllEvents',
    contactAdministrators: '/?redirect.contactAdministrators',
    duplicateEvent: '/?redirect.duplicateEvent',
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

const anExistingEvent = require( './dev/fixtures/event.json' );
const aValidMember = require( './dev/fixtures/member.json' );
const anIncompleteMember = require( './dev/fixtures/incompleteMember' );
const simpleSchemaExtensions = require( './dev/fixtures/simpleSchemaExtensions' );
const defaultValuesSchemaExtension = require( './dev/fixtures/defaultValuesSchemaExtension' );


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
  member: anIncompleteMember
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
  member: aValidMember
}, {
  link: '/bypass-attempt-to-event/contribute/event',
  agenda: {
    title: 'User attempts to load event form when he is not a valid member',
    description: 'When mounted, the event app does the necessary checks and re-routes user to member form if required. The link here points to the event form',
    slug: 'bypass-attempt-to-event',
    uid: 891391,
    id: 5
  },
  config: _.assign( {}, defaultConfig, {
    base: '/bypass-attempt-to-event/contribute',
  } ),
  member: anIncompleteMember
}, {
  link: '/confirmation-default/contribute',
  agenda: {
    title: 'Default confirmation page',
    description: 'Shows the default confirmation screen when the event is saved. It says the event is published.',
    slug: 'confirmation-default',
    uid: 1234321,
    id: 7
  },
  member: aValidMember,
  schemaExtensions: [ defaultValuesSchemaExtension ], // make it simple to reach next step
  config: _.assign( {}, defaultConfig, {
    base: '/confirmation-default/contribute'
  } )
}, {
  link: '/confirmation-moderated/contribute',
  agenda: {
    title: 'Confirmation page for moderated event',
    description: 'Shows the default confirmation screen when the event is saved. It says the event is published.',
    slug: 'confirmation-moderated',
    uid: 1234321,
    id: 7
  },
  member: aValidMember,
  schemaExtensions: [ defaultValuesSchemaExtension ], // make it simple to reach next step
  config: _.assign( {}, defaultConfig, {
    base: '/confirmation-moderated/contribute',
    confirmation: {
      state: 0
    }
  } )
}, {
  link: '/confirmation/contribute',
  agenda: {
    title: 'Confirmation page with a custom message',
    description: 'Default values are typed in to allow you to quickly go to the confirmation page',
    slug: 'confirmation',
    uid: 1234321,
    id: 6
  },
  member: aValidMember,
  schemaExtensions: [ defaultValuesSchemaExtension ], // make it simple to reach next step
  config: _.assign( {}, defaultConfig, {
    base: '/confirmation/contribute',
    confirmation: {
      message: 'This is a message from *Agenda administrators*'
    }
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
  link: '/a-new-event-with-preloaded-data/contribute/event',
  agenda: {
    title: 'A new event with preloaded data',
    description: 'Okay.',
    slug: 'a-new-event-with-preloaded-data',
    uid: 123987,
    id: 202022
  },
  config: _.assign( {}, defaultConfig, {
    base: '/a-new-event-with-preloaded-data/contribute',
  } ),
  event: {
    title: {
      fr: 'Un titre pré-chargé'
    }
  },
  member: aValidMember
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
  schemaExtensions: simpleSchemaExtensions
}, {
  link: '/slow-network-and-error/contribute/event/123',
  agenda: {
    title: 'Errors and delays',
    description: 'Yes.',
    slug: 'slow-network-and-error',
    uid: 121011101013,
    id: 8989
  },
  config: _.assign( {}, defaultConfig, {
    base: '/slow-network-and-error/contribute',
    edit: true,
    event: {
      message: '*Instructions appear in edition too*'
    }
  } ),
  event: anExistingEvent,
  delay: 3000,
  globalError: true
}, {
  link: '/an-event-with-embed-codes/contribute/event/123',
  agenda: {
    title: 'Embed codes are properly escaped',
    description: 'Because if they are not, things may not go well',
    slug: 'an-event-with-embed-codes',
    uid: 7878979,
    id: 9093
  },
  config: _.assign( {}, defaultConfig, {
    base: '/an-event-with-embed-codes/contribute',
    edit: true,
    event: {
      message: '*Instructions appear in edition too*'
    }
  } ),
  event: _.assign( {}, defaultConfig, {
    links: [ {
      link: 'https://www.youtube.com/channel/UCNJxVQDB5OkF-Y0NFLQBwHw',
      data: {
        url: 'https://www.youtube.com/channel/UCNJxVQDB5OkF-Y0NFLQBwHw',
        html: '<div class="iframely-embed"><div class="iframely-responsive" style="height: 168px; padding-bottom: 0;"><a href="https://www.youtube.com/channel/UCNJxVQDB5OkF-Y0NFLQBwHw" data-iframely-url="//cdn.iframe.ly/api/iframe?url=https%3A%2F%2Fwww.youtube.com%2Fchannel%2FUCNJxVQDB5OkF-Y0NFLQBwHw&amp;key=7db9d78bdbb5e7d79acb1240cae64b0e"></a></div></div><script async src="//cdn.iframe.ly/embed.js" charset="utf-8"></script>'
      }
    } ]
  } )
} ];
