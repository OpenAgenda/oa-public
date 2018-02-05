const userBertho = {
  culture: 'fr',
  uid: 31046551,
  name: 'Kévin Berthommier - OpenAgenda',
  thumbnail: null
};

const userYacine = {
  culture: 'fr',
  uid: 7339049,
  name: 'Yacine Bensalem - OpenAgenda',
  thumbnail: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
};

const userRomain = {
  culture: 'fr',
  uid: 99999999,
  name: 'Romain Lange - OpenAgenda',
  thumbnail: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
};

const userKaore = {
  culture: 'fr',
  uid: 75052324,
  name: 'Kaoré - OpenAgenda',
  thumbnail: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
};

export default [ {
  type: 'event',
  context: 'event',
  creator: true,
  destination: 'me',
  user: userBertho,
  conversation: {
    id: 135,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-02T15:57:40.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    creatorInbox: {
      id: 62817,
      type: 'agenda',
      identifier: 17388451,
      uid: 17388451,
      name: 'Test convs 12622',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 214,
      conversationId: 135,
      body: 'Salut !',
      createdAt: '2018-02-02T15:57:40.000Z',
      inboxUser: {
        id: 68431,
        inboxId: 62817,
        userUid: 31046551,
        leftAt: null,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      inbox: {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'event',
  context: 'event',
  creator: true,
  destination: 'agenda',
  user: userYacine,
  conversation: {
    id: 138,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:21:40.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 152,
    creatorInboxUser: {
      id: 50703,
      inboxId: 152,
      userUid: 7339049,
      leftAt: null,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    creatorInbox: {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    inboxUser: {
      id: 50703,
      inboxId: 152,
      userUid: 7339049,
      leftAt: null,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    latestMessage: {
      id: 217,
      conversationId: 138,
      body: 'Ils sont là les admins ?!',
      createdAt: '2018-02-05T10:21:41.000Z',
      inboxUser: {
        id: 50703,
        inboxId: 152,
        userUid: 7339049,
        leftAt: null,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      inbox: {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'event',
  context: 'event',
  creator: false,
  destination: 'me',
  user: userYacine,
  conversation: {
    id: 139,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:30:55.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 152,
    creatorInbox: {
      id: 62817,
      type: 'agenda',
      identifier: 17388451,
      uid: 17388451,
      name: 'Test convs 12622',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    inboxUser: {
      id: 50703,
      inboxId: 152,
      userUid: 7339049,
      leftAt: null,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    latestMessage: {
      id: 218,
      conversationId: 139,
      body: 'Salut, contributeur !',
      createdAt: '2018-02-05T10:30:55.000Z',
      inbox: {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'event',
  context: 'event',
  creator: false,
  destination: 'contributor+agenda',
  user: userBertho,
  conversation: {
    id: 140,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:38:30.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInbox: {
      id: 19,
      type: 'user',
      identifier: 99999999,
      uid: 99999999,
      name: 'Romain Lange - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
    },
    latestMessage: {
      id: 219,
      conversationId: 140,
      body: 'Salut tout la monde !',
      createdAt: '2018-02-05T10:38:30.000Z',
      inbox: {
        id: 19,
        type: 'user',
        identifier: 99999999,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      }
    },
    inboxes: [
      {
        id: 19,
        type: 'user',
        identifier: 99999999,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      },
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'event',
  context: 'event',
  creator: false,
  destination: 'contributor',
  user: userKaore,
  conversation: {
    id: 139,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:30:55.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    creatorInbox: {
      id: 62817,
      type: 'agenda',
      identifier: 17388451,
      uid: 17388451,
      name: 'Test convs 12622',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 218,
      conversationId: 139,
      body: 'Salut, contributeur !',
      createdAt: '2018-02-05T10:30:55.000Z',
      inboxUser: {
        id: 68431,
        inboxId: 62817,
        userUid: 31046551,
        leftAt: null,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      inbox: {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'event',
  context: 'agenda',
  creator: true,
  destination: 'contributor',
  user: userBertho,
  conversation: {
    id: 139,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:30:55.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    creatorInbox: {
      id: 62817,
      type: 'agenda',
      identifier: 17388451,
      uid: 17388451,
      name: 'Test convs 12622',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 218,
      conversationId: 139,
      body: 'Salut, contributeur !',
      createdAt: '2018-02-05T10:30:55.000Z',
      inboxUser: {
        id: 68431,
        inboxId: 62817,
        userUid: 31046551,
        leftAt: null,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      inbox: {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'event',
  context: 'agenda',
  creator: true,
  destination: 'agenda',
  user: userYacine,
  conversation: {
    id: 138,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:21:40.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInbox: {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    latestMessage: {
      id: 217,
      conversationId: 138,
      body: 'Ils sont là les admins ?!',
      createdAt: '2018-02-05T10:21:41.000Z',
      inbox: {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'event',
  context: 'agenda',
  creator: false,
  destination: 'contributor',
  user: userKaore,
  conversation: {
    id: 139,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:30:55.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    creatorInbox: {
      id: 62817,
      type: 'agenda',
      identifier: 17388451,
      uid: 17388451,
      name: 'Test convs 12622',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 218,
      conversationId: 139,
      body: 'Salut, contributeur !',
      createdAt: '2018-02-05T10:30:55.000Z',
      inboxUser: {
        id: 68431,
        inboxId: 62817,
        userUid: 31046551,
        leftAt: null,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      inbox: {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'event',
  context: 'agenda',
  creator: false,
  destination: 'contributor+agenda',
  user: userBertho,
  conversation: {
    id: 140,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:38:30.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInbox: {
      id: 19,
      type: 'user',
      identifier: 99999999,
      uid: 99999999,
      name: 'Romain Lange - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
    },
    latestMessage: {
      id: 219,
      conversationId: 140,
      body: 'Salut tout la monde !',
      createdAt: '2018-02-05T10:38:30.000Z',
      inbox: {
        id: 19,
        type: 'user',
        identifier: 99999999,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      }
    },
    inboxes: [
      {
        id: 19,
        type: 'user',
        identifier: 99999999,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      },
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'event',
  context: 'agenda',
  creator: false,
  destination: 'me',
  user: userYacine,
  conversation: {
    id: 139,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:30:55.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    creatorInbox: {
      id: 62817,
      type: 'agenda',
      identifier: 17388451,
      uid: 17388451,
      name: 'Test convs 12622',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 218,
      conversationId: 139,
      body: 'Salut, contributeur !',
      createdAt: '2018-02-05T10:30:55.000Z',
      inboxUser: {
        id: 68431,
        inboxId: 62817,
        userUid: 31046551,
        leftAt: null,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      inbox: {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'event',
  context: 'user',
  creator: true,
  destination: 'contributor',
  user: userBertho,
  conversation: {
    id: 139,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:30:55.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    creatorInbox: {
      id: 62817,
      type: 'agenda',
      identifier: 17388451,
      uid: 17388451,
      name: 'Test convs 12622',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    inboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 218,
      conversationId: 139,
      body: 'Salut, contributeur !',
      createdAt: '2018-02-05T10:30:55.000Z',
      inboxUser: {
        id: 68431,
        inboxId: 62817,
        userUid: 31046551,
        leftAt: null,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      inbox: {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'event',
  context: 'user',
  creator: true,
  destination: 'agenda',
  user: userYacine,
  conversation: {
    id: 138,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:21:40.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 152,
    creatorInboxUser: {
      id: 50703,
      inboxId: 152,
      userUid: 7339049,
      leftAt: null,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    creatorInbox: {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    inboxUser: {
      id: 50703,
      inboxId: 152,
      userUid: 7339049,
      leftAt: null,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    latestMessage: {
      id: 217,
      conversationId: 138,
      body: 'Ils sont là les admins ?!',
      createdAt: '2018-02-05T10:21:41.000Z',
      inboxUser: {
        id: 50703,
        inboxId: 152,
        userUid: 7339049,
        leftAt: null,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      inbox: {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'event',
  context: 'user',
  creator: false,
  destination: 'contributor',
  user: userKaore,
  conversation: {
    id: 139,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:30:55.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    creatorInbox: {
      id: 62817,
      type: 'agenda',
      identifier: 17388451,
      uid: 17388451,
      name: 'Test convs 12622',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    inboxUser: {
      id: 68430,
      inboxId: 62817,
      userUid: 75052324,
      leftAt: null,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    latestMessage: {
      id: 218,
      conversationId: 139,
      body: 'Salut, contributeur !',
      createdAt: '2018-02-05T10:30:55.000Z',
      inboxUser: {
        id: 68431,
        inboxId: 62817,
        userUid: 31046551,
        leftAt: null,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      inbox: {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'event',
  context: 'user',
  creator: false,
  destination: 'contributor+agenda',
  user: userBertho,
  conversation: {
    id: 140,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:38:30.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInbox: {
      id: 19,
      type: 'user',
      identifier: 99999999,
      uid: 99999999,
      name: 'Romain Lange - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
    },
    inboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 219,
      conversationId: 140,
      body: 'Salut tout la monde !',
      createdAt: '2018-02-05T10:38:30.000Z',
      inbox: {
        id: 19,
        type: 'user',
        identifier: 99999999,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      }
    },
    inboxes: [
      {
        id: 19,
        type: 'user',
        identifier: 99999999,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      },
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'event',
  context: 'user',
  creator: false,
  destination: 'me',
  user: userYacine,
  conversation: {
    id: 139,
    type: 'event',
    typeIdentifier: 25404061,
    store: {
      params: {
        agendaTitle: 'Test convs 12622',
        eventTitle: 'Contactez-moi !',
        agendaUid: 17388451
      }
    },
    createdAt: '2018-02-05T10:30:55.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    creatorInbox: {
      id: 62817,
      type: 'agenda',
      identifier: 17388451,
      uid: 17388451,
      name: 'Test convs 12622',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    inboxUser: {
      id: 68432,
      inboxId: 62817,
      userUid: 7339049,
      leftAt: null,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    latestMessage: {
      id: 218,
      conversationId: 139,
      body: 'Salut, contributeur !',
      createdAt: '2018-02-05T10:30:55.000Z',
      inboxUser: {
        id: 68431,
        inboxId: 62817,
        userUid: 31046551,
        leftAt: null,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      inbox: {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'contact_form',
  context: 'agenda',
  creator: true,
  user: userYacine,
  conversation: {
    id: 133,
    type: 'contact_form',
    typeIdentifier: 17388451,
    store: {
      params: {
        agendaTitle: 'Test convs 12622'
      }
    },
    createdAt: '2018-02-01T14:18:49.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInbox: {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    latestMessage: {
      id: 211,
      conversationId: 133,
      body: 'dsqds<ds<',
      createdAt: '2018-02-01T14:18:49.000Z',
      inbox: {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'contact_form',
  context: 'agenda',
  creator: false,
  user: userBertho,
  conversation: {
    id: 133,
    type: 'contact_form',
    typeIdentifier: 17388451,
    store: {
      params: {
        agendaTitle: 'Test convs 12622'
      }
    },
    createdAt: '2018-02-01T14:18:49.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInbox: {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    latestMessage: {
      id: 211,
      conversationId: 133,
      body: 'dsqds<ds<',
      createdAt: '2018-02-01T14:18:49.000Z',
      inbox: {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'contact_form',
  context: 'user',
  creator: true,
  user: userYacine,
  conversation: {
    id: 133,
    type: 'contact_form',
    typeIdentifier: 17388451,
    store: {
      params: {
        agendaTitle: 'Test convs 12622'
      }
    },
    createdAt: '2018-02-01T14:18:49.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 152,
    creatorInboxUser: {
      id: 50703,
      inboxId: 152,
      userUid: 7339049,
      leftAt: null,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    creatorInbox: {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    inboxUser: {
      id: 50703,
      inboxId: 152,
      userUid: 7339049,
      leftAt: null,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    latestMessage: {
      id: 211,
      conversationId: 133,
      body: 'dsqds<ds<',
      createdAt: '2018-02-01T14:18:49.000Z',
      inboxUser: {
        id: 50703,
        inboxId: 152,
        userUid: 7339049,
        leftAt: null,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      inbox: {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'contact_form',
  context: 'user',
  creator: false,
  user: userBertho,
  conversation: {
    id: 133,
    type: 'contact_form',
    typeIdentifier: 17388451,
    store: {
      params: {
        agendaTitle: 'Test convs 12622'
      }
    },
    createdAt: '2018-02-01T14:18:49.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInbox: {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    inboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 211,
      conversationId: 133,
      body: 'dsqds<ds<',
      createdAt: '2018-02-01T14:18:49.000Z',
      inbox: {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'request_contribute',
  context: 'agenda',
  creator: true,
  user: userYacine,
  conversation: {
    id: 126,
    type: 'request_contribute',
    typeIdentifier: 17388451,
    store: {
      params: {
        agendaTitle: 'Test convs 12622'
      }
    },
    createdAt: '2018-02-01T13:40:21.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInbox: {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    latestMessage: {
      id: 202,
      conversationId: 126,
      body: 'hein ?',
      createdAt: '2018-02-01T13:40:21.000Z',
      inbox: {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'accept',
        label: {
          fr: 'Ajouter en tant que contributeur',
          en: 'Add as a contributor'
        },
        kind: 'primary',
        confirmationModalTitle: {
          fr: 'Accepter le contributeur',
          en: 'Accept the contributor'
        },
        confirmationModalLabel: {
          fr: 'Êtes-vous sûr de vouloir accepter ce contributeur ?',
          en: 'Are you sure you want to accept this contributor ?'
        }
      },
      {
        code: 'refuse',
        label: {
          fr: 'Refuser la demande',
          en: 'Refuse the request'
        },
        kind: 'danger',
        confirmationModalTitle: {
          fr: 'Refuser le contributeur',
          en: 'Refuse the contributor'
        },
        confirmationModalLabel: {
          fr: 'Êtes-vous sûr de vouloir refuser ce contributeur ?',
          en: 'Are you sure you want to refuse this contributor?'
        }
      }
    ]
  }
}, {
  type: 'request_contribute',
  context: 'agenda',
  creator: false,
  user: userBertho,
  conversation: {
    id: 126,
    type: 'request_contribute',
    typeIdentifier: 17388451,
    store: {
      params: {
        agendaTitle: 'Test convs 12622'
      }
    },
    createdAt: '2018-02-01T13:40:21.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInbox: {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    inboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 202,
      conversationId: 126,
      body: 'hein ?',
      createdAt: '2018-02-01T13:40:21.000Z',
      inbox: {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'accept',
        label: {
          fr: 'Ajouter en tant que contributeur',
          en: 'Add as a contributor'
        },
        kind: 'primary',
        confirmationModalTitle: {
          fr: 'Accepter le contributeur',
          en: 'Accept the contributor'
        },
        confirmationModalLabel: {
          fr: 'Êtes-vous sûr de vouloir accepter ce contributeur ?',
          en: 'Are you sure you want to accept this contributor ?'
        }
      },
      {
        code: 'refuse',
        label: {
          fr: 'Refuser la demande',
          en: 'Refuse the request'
        },
        kind: 'danger',
        confirmationModalTitle: {
          fr: 'Refuser le contributeur',
          en: 'Refuse the contributor'
        },
        confirmationModalLabel: {
          fr: 'Êtes-vous sûr de vouloir refuser ce contributeur ?',
          en: 'Are you sure you want to refuse this contributor?'
        }
      }
    ]
  }
}, {
  type: 'request_contribute',
  context: 'user',
  creator: true,
  user: userYacine,
  conversation: {
    id: 126,
    type: 'request_contribute',
    typeIdentifier: 17388451,
    store: {
      params: {
        agendaTitle: 'Test convs 12622'
      }
    },
    createdAt: '2018-02-01T13:40:21.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 152,
    creatorInboxUser: {
      id: 50703,
      inboxId: 152,
      userUid: 7339049,
      leftAt: null,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    creatorInbox: {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    inboxUser: {
      id: 50703,
      inboxId: 152,
      userUid: 7339049,
      leftAt: null,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    latestMessage: {
      id: 202,
      conversationId: 126,
      body: 'hein ?',
      createdAt: '2018-02-01T13:40:21.000Z',
      inboxUser: {
        id: 50703,
        inboxId: 152,
        userUid: 7339049,
        leftAt: null,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      inbox: {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'default',
        label: {
          fr: 'Fermer la conversation',
          en: 'Close the conversation'
        },
        kind: 'success'
      }
    ]
  }
}, {
  type: 'request_contribute',
  context: 'user',
  creator: false,
  user: userBertho,
  conversation: {
    id: 126,
    type: 'request_contribute',
    typeIdentifier: 17388451,
    store: {
      params: {
        agendaTitle: 'Test convs 12622'
      }
    },
    createdAt: '2018-02-01T13:40:21.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 62817,
    creatorInbox: {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    latestMessage: {
      id: 202,
      conversationId: 126,
      body: 'hein ?',
      createdAt: '2018-02-01T13:40:21.000Z',
      inbox: {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      }
    },
    inboxes: [
      {
        id: 152,
        type: 'user',
        identifier: 7339049,
        uid: 7339049,
        name: 'Yacine Bensalem - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
      },
      {
        id: 62817,
        type: 'agenda',
        identifier: 17388451,
        uid: 17388451,
        name: 'Test convs 12622',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ],
    actions: [
      {
        code: 'accept',
        label: {
          fr: 'Ajouter en tant que contributeur',
          en: 'Add as a contributor'
        },
        kind: 'primary',
        confirmationModalTitle: {
          fr: 'Accepter le contributeur',
          en: 'Accept the contributor'
        },
        confirmationModalLabel: {
          fr: 'Êtes-vous sûr de vouloir accepter ce contributeur ?',
          en: 'Are you sure you want to accept this contributor ?'
        }
      },
      {
        code: 'refuse',
        label: {
          fr: 'Refuser la demande',
          en: 'Refuse the request'
        },
        kind: 'danger',
        confirmationModalTitle: {
          fr: 'Refuser le contributeur',
          en: 'Refuse the contributor'
        },
        confirmationModalLabel: {
          fr: 'Êtes-vous sûr de vouloir refuser ce contributeur ?',
          en: 'Are you sure you want to refuse this contributor?'
        }
      }
    ]
  }
} ];
