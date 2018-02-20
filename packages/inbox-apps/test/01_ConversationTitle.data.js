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
    ]
  }
}, {
  type: 'edition_request',
  context: 'event',
  creator: true,
  user: userKaore,
  conversation: {
    id: 143,
    type: 'edition_request',
    typeIdentifier: 22722175,
    store: {
      params: {
        agendaTitle: 'La Gargouille',
        eventTitle: 'Traitement de texte niveau 1',
        agendaUid: 48959239
      }
    },
    createdAt: '2018-02-06T09:32:16.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 14,
    creatorInboxUser: {
      id: 13,
      inboxId: 14,
      userUid: 75052324,
      leftAt: null,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    creatorInbox: {
      id: 14,
      type: 'agenda',
      identifier: 48959239,
      uid: 48959239,
      name: 'La Gargouille',
      avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
    },
    latestMessage: {
      id: 222,
      conversationId: 143,
      body: 'Peut-on modifier votre event ?!',
      createdAt: '2018-02-06T09:32:16.000Z',
      inboxUser: {
        id: 13,
        inboxId: 14,
        userUid: 75052324,
        leftAt: null,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      },
      inbox: {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    },
    inboxes: [
      {
        id: 1444,
        type: 'user',
        identifier: 99999986,
        uid: 99999986,
        name: 'AGECA',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    ]
  }
}, {
  type: 'edition_request',
  context: 'event',
  creator: false,
  user: userBertho,
  conversation: {
    id: 143,
    type: 'edition_request',
    typeIdentifier: 22722175,
    store: {
      params: {
        agendaTitle: 'La Gargouille',
        eventTitle: 'Traitement de texte niveau 1',
        agendaUid: 48959239
      }
    },
    createdAt: '2018-02-06T09:32:16.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 14,
    creatorInboxUser: {
      id: 13,
      inboxId: 14,
      userUid: 75052324,
      leftAt: null,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    creatorInbox: {
      id: 14,
      type: 'agenda',
      identifier: 48959239,
      uid: 48959239,
      name: 'La Gargouille',
      avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
    },
    latestMessage: {
      id: 222,
      conversationId: 143,
      body: 'Peut-on modifier votre event ?!',
      createdAt: '2018-02-06T09:32:16.000Z',
      inboxUser: {
        id: 13,
        inboxId: 14,
        userUid: 75052324,
        leftAt: null,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      },
      inbox: {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    },
    inboxes: [
      {
        id: 1444,
        type: 'user',
        identifier: 99999986,
        uid: 99999986,
        name: 'AGECA',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    ]
  }
}, {
  type: 'edition_request',
  context: 'agenda',
  creator: true,
  user: userKaore,
  conversation: {
    id: 143,
    type: 'edition_request',
    typeIdentifier: 22722175,
    store: {
      params: {
        agendaTitle: 'La Gargouille',
        eventTitle: 'Traitement de texte niveau 1',
        agendaUid: 48959239
      }
    },
    createdAt: '2018-02-06T09:32:16.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 14,
    creatorInboxUser: {
      id: 13,
      inboxId: 14,
      userUid: 75052324,
      leftAt: null,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    creatorInbox: {
      id: 14,
      type: 'agenda',
      identifier: 48959239,
      uid: 48959239,
      name: 'La Gargouille',
      avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
    },
    latestMessage: {
      id: 222,
      conversationId: 143,
      body: 'Peut-on modifier votre event ?!',
      createdAt: '2018-02-06T09:32:16.000Z',
      inboxUser: {
        id: 13,
        inboxId: 14,
        userUid: 75052324,
        leftAt: null,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      },
      inbox: {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    },
    inboxes: [
      {
        id: 1444,
        type: 'user',
        identifier: 99999986,
        uid: 99999986,
        name: 'AGECA',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    ]
  }
}, {
  type: 'edition_request',
  context: 'agenda',
  creator: false,
  user: userBertho,
  conversation: {
    id: 143,
    type: 'edition_request',
    typeIdentifier: 22722175,
    store: {
      params: {
        agendaTitle: 'La Gargouille',
        eventTitle: 'Traitement de texte niveau 1',
        agendaUid: 48959239
      }
    },
    createdAt: '2018-02-06T09:32:16.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 14,
    creatorInboxUser: {
      id: 13,
      inboxId: 14,
      userUid: 75052324,
      leftAt: null,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    creatorInbox: {
      id: 14,
      type: 'agenda',
      identifier: 48959239,
      uid: 48959239,
      name: 'La Gargouille',
      avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
    },
    latestMessage: {
      id: 222,
      conversationId: 143,
      body: 'Peut-on modifier votre event ?!',
      createdAt: '2018-02-06T09:32:16.000Z',
      inboxUser: {
        id: 13,
        inboxId: 14,
        userUid: 75052324,
        leftAt: null,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      },
      inbox: {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    },
    inboxes: [
      {
        id: 1444,
        type: 'user',
        identifier: 99999986,
        uid: 99999986,
        name: 'AGECA',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    ]
  }
}, {
  type: 'edition_request',
  context: 'user',
  creator: true,
  user: userKaore,
  conversation: {
    id: 143,
    type: 'edition_request',
    typeIdentifier: 22722175,
    store: {
      params: {
        agendaTitle: 'La Gargouille',
        eventTitle: 'Traitement de texte niveau 1',
        agendaUid: 48959239
      }
    },
    createdAt: '2018-02-06T09:32:16.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 14,
    creatorInboxUser: {
      id: 13,
      inboxId: 14,
      userUid: 75052324,
      leftAt: null,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    creatorInbox: {
      id: 14,
      type: 'agenda',
      identifier: 48959239,
      uid: 48959239,
      name: 'La Gargouille',
      avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
    },
    inboxUser: {
      id: 13,
      inboxId: 14,
      userUid: 75052324,
      leftAt: null,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    latestMessage: {
      id: 222,
      conversationId: 143,
      body: 'Peut-on modifier votre event ?!',
      createdAt: '2018-02-06T09:32:16.000Z',
      inboxUser: {
        id: 13,
        inboxId: 14,
        userUid: 75052324,
        leftAt: null,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      },
      inbox: {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    },
    inboxes: [
      {
        id: 1444,
        type: 'user',
        identifier: 99999986,
        uid: 99999986,
        name: 'AGECA',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    ]
  }
}, {
  type: 'edition_request',
  context: 'user',
  creator: false,
  user: userBertho,
  conversation: {
    id: 143,
    type: 'edition_request',
    typeIdentifier: 22722175,
    store: {
      params: {
        agendaTitle: 'La Gargouille',
        eventTitle: 'Traitement de texte niveau 1',
        agendaUid: 48959239
      }
    },
    createdAt: '2018-02-06T09:32:16.000Z',
    updatedAt: null,
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 1444,
    creatorInbox: {
      id: 14,
      type: 'agenda',
      identifier: 48959239,
      uid: 48959239,
      name: 'La Gargouille',
      avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
    },
    inboxUser: {
      id: 19190,
      inboxId: 1444,
      userUid: 99999986,
      leftAt: null,
      uid: 99999986,
      name: 'AGECA',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 222,
      conversationId: 143,
      body: 'Peut-on modifier votre event ?!',
      createdAt: '2018-02-06T09:32:16.000Z',
      inbox: {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    },
    inboxes: [
      {
        id: 1444,
        type: 'user',
        identifier: 99999986,
        uid: 99999986,
        name: 'AGECA',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      {
        id: 14,
        type: 'agenda',
        identifier: 48959239,
        uid: 48959239,
        name: 'La Gargouille',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda48959239.jpg'
      }
    ]
  }
}, {
  type: 'suggest_location_change',
  context: 'agenda',
  creator: true,
  user: userKaore,
  conversation: {
    id: 75,
    type: 'suggest_location_change',
    typeIdentifier: 88125499,
    store: {
      params: {
        agendaTitle: 'Salon International de l\'Agriculture 2018',
        agendaUid: 6999235,
        locationName: 'Stand Grands Terroirs Lot',
        locationUid: 88125499
      }
    },
    createdAt: '2018-02-09T10:22:03.000Z',
    updatedAt: '2018-02-09T10:22:03.000Z',
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 54708,
    creatorInbox: {
      id: 31340,
      type: 'user',
      identifier: 75052324,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    latestMessage: {
      id: 129,
      conversationId: 75,
      body: 'zffezfe',
      createdAt: '2018-02-09T10:22:03.000Z',
      inbox: {
        id: 31340,
        type: 'user',
        identifier: 75052324,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      }
    },
    inboxes: [
      {
        id: 31340,
        type: 'user',
        identifier: 75052324,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      },
      {
        id: 54708,
        type: 'agenda',
        identifier: 6999235,
        uid: 6999235,
        name: 'Salon International de l\'Agriculture 2018',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda45072293.jpg'
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
  type: 'suggest_location_change',
  context: 'agenda',
  creator: false,
  user: userRomain,
  conversation: {
    id: 75,
    type: 'suggest_location_change',
    typeIdentifier: 88125499,
    store: {
      params: {
        agendaTitle: 'Salon International de l\'Agriculture 2018',
        agendaUid: 6999235,
        locationName: 'Stand Grands Terroirs Lot',
        locationUid: 88125499
      }
    },
    createdAt: '2018-02-09T10:22:03.000Z',
    updatedAt: '2018-02-09T10:22:03.000Z',
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 54708,
    creatorInbox: {
      id: 31340,
      type: 'user',
      identifier: 75052324,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    latestMessage: {
      id: 129,
      conversationId: 75,
      body: 'zffezfe',
      createdAt: '2018-02-09T10:22:03.000Z',
      inbox: {
        id: 31340,
        type: 'user',
        identifier: 75052324,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      }
    },
    inboxes: [
      {
        id: 31340,
        type: 'user',
        identifier: 75052324,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      },
      {
        id: 54708,
        type: 'agenda',
        identifier: 6999235,
        uid: 6999235,
        name: 'Salon International de l\'Agriculture 2018',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda45072293.jpg'
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
  type: 'suggest_location_change',
  context: 'user',
  creator: true,
  user: userKaore,
  conversation: {
    id: 75,
    type: 'suggest_location_change',
    typeIdentifier: 88125499,
    store: {
      params: {
        agendaTitle: 'Salon International de l\'Agriculture 2018',
        agendaUid: 6999235,
        locationName: 'Stand Grands Terroirs Lot',
        locationUid: 88125499
      }
    },
    createdAt: '2018-02-09T10:22:03.000Z',
    updatedAt: '2018-02-09T10:22:03.000Z',
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 31340,
    creatorInboxUser: {
      id: 29696,
      inboxId: 31340,
      userUid: 75052324,
      leftAt: null,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    creatorInbox: {
      id: 31340,
      type: 'user',
      identifier: 75052324,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    inboxUser: {
      id: 29696,
      inboxId: 31340,
      userUid: 75052324,
      leftAt: null,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    latestMessage: {
      id: 129,
      conversationId: 75,
      body: 'zffezfe',
      createdAt: '2018-02-09T10:22:03.000Z',
      inboxUser: {
        id: 29696,
        inboxId: 31340,
        userUid: 75052324,
        leftAt: null,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      },
      inbox: {
        id: 31340,
        type: 'user',
        identifier: 75052324,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      }
    },
    inboxes: [
      {
        id: 31340,
        type: 'user',
        identifier: 75052324,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      },
      {
        id: 54708,
        type: 'agenda',
        identifier: 6999235,
        uid: 6999235,
        name: 'Salon International de l\'Agriculture 2018',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda45072293.jpg'
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
  type: 'suggest_location_change',
  context: 'user',
  creator: false,
  user: userRomain,
  conversation: {
    id: 75,
    type: 'suggest_location_change',
    typeIdentifier: 88125499,
    store: {
      params: {
        agendaTitle: 'Salon International de l\'Agriculture 2018',
        agendaUid: 6999235,
        locationName: 'Stand Grands Terroirs Lot',
        locationUid: 88125499
      }
    },
    createdAt: '2018-02-09T10:22:03.000Z',
    updatedAt: '2018-02-09T10:22:03.000Z',
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 54708,
    creatorInbox: {
      id: 31340,
      type: 'user',
      identifier: 75052324,
      uid: 75052324,
      name: 'Kaoré - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
    },
    inboxUser: {
      id: 53233,
      inboxId: 54708,
      userUid: 99999999,
      leftAt: null,
      uid: 99999999,
      name: 'Romain Lange - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
    },
    latestMessage: {
      id: 129,
      conversationId: 75,
      body: 'zffezfe',
      createdAt: '2018-02-09T10:22:03.000Z',
      inbox: {
        id: 31340,
        type: 'user',
        identifier: 75052324,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      }
    },
    inboxes: [
      {
        id: 31340,
        type: 'user',
        identifier: 75052324,
        uid: 75052324,
        name: 'Kaoré - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg'
      },
      {
        id: 54708,
        type: 'agenda',
        identifier: 6999235,
        uid: 6999235,
        name: 'Salon International de l\'Agriculture 2018',
        avatar: 'https://cibuldev.s3.amazonaws.com/agenda45072293.jpg'
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
  type: 'contact_member',
  context: 'user',
  creator: true,
  user: userRomain,
  conversation: {
    id: 81,
    type: 'contact_member',
    typeIdentifier: 11649,
    store: {
      params: {
        agendaTitle: 'Journées européennes du patrimoine 2016 (version simplifiée)',
        userUid: 31046551,
        userName: 'Kévin Berthommier - OpenAgenda'
      }
    },
    createdAt: '2018-02-13T10:01:02.000Z',
    updatedAt: '2018-02-13T10:01:02.000Z',
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 3244,
    creatorInboxUser: {
      id: 1580,
      inboxId: 3244,
      userUid: 99999999,
      leftAt: null,
      uid: 99999999,
      name: 'Romain Lange - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
    },
    creatorInbox: {
      id: 3244,
      type: 'user',
      identifier: 99999999,
      uid: 99999999,
      name: 'Romain Lange - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
    },
    inboxUser: {
      id: 1580,
      inboxId: 3244,
      userUid: 99999999,
      leftAt: null,
      uid: 99999999,
      name: 'Romain Lange - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
    },
    latestMessage: {
      id: 136,
      conversationId: 81,
      body: 'Salut Bertho !',
      createdAt: '2018-02-13T10:01:02.000Z',
      inboxUser: {
        id: 1580,
        inboxId: 3244,
        userUid: 99999999,
        leftAt: null,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      },
      inbox: {
        id: 3244,
        type: 'user',
        identifier: 99999999,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      }
    },
    inboxes: [
      {
        id: 3244,
        type: 'user',
        identifier: 99999999,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      },
      {
        id: 3204,
        type: 'user',
        identifier: 31046551,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'contact_member',
  context: 'user',
  creator: false,
  destination: 'me',
  user: userBertho,
  conversation: {
    id: 81,
    type: 'contact_member',
    typeIdentifier: 11649,
    store: {
      params: {
        agendaTitle: 'Journées européennes du patrimoine 2016 (version simplifiée)',
        userUid: 31046551,
        userName: 'Kévin Berthommier - OpenAgenda'
      }
    },
    createdAt: '2018-02-13T10:01:02.000Z',
    updatedAt: '2018-02-13T10:01:02.000Z',
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 3204,
    creatorInbox: {
      id: 3244,
      type: 'user',
      identifier: 99999999,
      uid: 99999999,
      name: 'Romain Lange - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
    },
    inboxUser: {
      id: 1540,
      inboxId: 3204,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 136,
      conversationId: 81,
      body: 'Salut Bertho !',
      createdAt: '2018-02-13T10:01:02.000Z',
      inbox: {
        id: 3244,
        type: 'user',
        identifier: 99999999,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      }
    },
    inboxes: [
      {
        id: 3244,
        type: 'user',
        identifier: 99999999,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      },
      {
        id: 3204,
        type: 'user',
        identifier: 31046551,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'contact_member',
  context: 'user',
  creator: false,
  destination: 'member',
  user: userBertho,
  conversation: {
    id: 82,
    type: 'contact_member',
    typeIdentifier: 10987,
    store: {
      params: {
        agendaTitle: 'Journées européennes du patrimoine 2016 (version simplifiée)',
        userUid: 75052324,
        userName: 'Kaoré - OpenAgenda'
      }
    },
    createdAt: '2018-02-13T10:01:32.000Z',
    updatedAt: '2018-02-13T10:01:32.000Z',
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 56678,
    creatorInboxUser: {
      id: 58149,
      inboxId: 56678,
      userUid: 99999999,
      leftAt: null,
      uid: 99999999,
      name: 'Romain Lange - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
    },
    creatorInbox: {
      id: 56678,
      type: 'agenda',
      identifier: 91362789,
      uid: 91362789,
      name: 'Journées européennes du patrimoine 2016 (version simplifiée)',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    inboxUser: {
      id: 58146,
      inboxId: 56678,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 137,
      conversationId: 82,
      body: 'Salut Kaoré !',
      createdAt: '2018-02-13T10:01:32.000Z',
      inboxUser: {
        id: 58149,
        inboxId: 56678,
        userUid: 99999999,
        leftAt: null,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      },
      inbox: {
        id: 56678,
        type: 'agenda',
        identifier: 91362789,
        uid: 91362789,
        name: 'Journées européennes du patrimoine 2016 (version simplifiée)',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 56678,
        type: 'agenda',
        identifier: 91362789,
        uid: 91362789,
        name: 'Journées européennes du patrimoine 2016 (version simplifiée)',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'contact_member',
  context: 'agenda',
  creator: true,
  user: userRomain,
  conversation: {
    id: 82,
    type: 'contact_member',
    typeIdentifier: 10987,
    store: {
      params: {
        agendaTitle: 'Journées européennes du patrimoine 2016 (version simplifiée)',
        userUid: 75052324,
        userName: 'Kaoré - OpenAgenda'
      }
    },
    createdAt: '2018-02-13T10:01:32.000Z',
    updatedAt: '2018-02-13T10:01:32.000Z',
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 56678,
    creatorInboxUser: {
      id: 58149,
      inboxId: 56678,
      userUid: 99999999,
      leftAt: null,
      uid: 99999999,
      name: 'Romain Lange - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
    },
    creatorInbox: {
      id: 56678,
      type: 'agenda',
      identifier: 91362789,
      uid: 91362789,
      name: 'Journées européennes du patrimoine 2016 (version simplifiée)',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 137,
      conversationId: 82,
      body: 'Salut Kaoré !',
      createdAt: '2018-02-13T10:01:32.000Z',
      inboxUser: {
        id: 58149,
        inboxId: 56678,
        userUid: 99999999,
        leftAt: null,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      },
      inbox: {
        id: 56678,
        type: 'agenda',
        identifier: 91362789,
        uid: 91362789,
        name: 'Journées européennes du patrimoine 2016 (version simplifiée)',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 56678,
        type: 'agenda',
        identifier: 91362789,
        uid: 91362789,
        name: 'Journées européennes du patrimoine 2016 (version simplifiée)',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'contact_member',
  context: 'agenda',
  creator: false,
  destination: 'me',
  user: userKaore,
  conversation: {
    id: 82,
    type: "contact_member",
    typeIdentifier: 10987,
    store: {
      params: {
        agendaTitle:
          "Journées européennes du patrimoine 2016 (version simplifiée)",
        userUid: 75052324,
        userName: "Kaoré - OpenAgenda"
      }
    },
    createdAt: "2018-02-13T10:01:32.000Z",
    updatedAt: "2018-02-13T10:01:32.000Z",
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 56678,
    creatorInboxUser: {
      id: 58149,
      inboxId: 56678,
      userUid: 99999999,
      leftAt: null,
      uid: 99999999,
      name: "Romain Lange - OpenAgenda",
      avatar: "https://cibuldev.s3.amazonaws.com/profile99999999.jpg"
    },
    creatorInbox: {
      id: 56678,
      type: "agenda",
      identifier: 91362789,
      uid: 91362789,
      name: "Journées européennes du patrimoine 2016 (version simplifiée)",
      avatar: "//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png"
    },
    inboxUser: {
      id: 58145,
      inboxId: 56678,
      userUid: 75052324,
      leftAt: null,
      uid: 75052324,
      name: "Kaoré - OpenAgenda",
      avatar: "https://cibuldev.s3.amazonaws.com/review_kaore-olafsson_01.jpg"
    },
    latestMessage: {
      id: 137,
      conversationId: 82,
      body: "Salut Kaoré !",
      createdAt: "2018-02-13T10:01:32.000Z",
      inboxUser: {
        id: 58149,
        inboxId: 56678,
        userUid: 99999999,
        leftAt: null,
        uid: 99999999,
        name: "Romain Lange - OpenAgenda",
        avatar: "https://cibuldev.s3.amazonaws.com/profile99999999.jpg"
      },
      inbox: {
        id: 56678,
        type: "agenda",
        identifier: 91362789,
        uid: 91362789,
        name: "Journées européennes du patrimoine 2016 (version simplifiée)",
        avatar: "//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png"
      }
    },
    inboxes: [
      {
        id: 56678,
        type: "agenda",
        identifier: 91362789,
        uid: 91362789,
        name: "Journées européennes du patrimoine 2016 (version simplifiée)",
        avatar: "//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png"
      }
    ]
  }
}, {
  type: 'contact_member',
  context: 'agenda',
  creator: false,
  destination: 'member',
  user: userBertho,
  conversation: {
    id: 82,
    type: 'contact_member',
    typeIdentifier: 10987,
    store: {
      params: {
        agendaTitle: 'Journées européennes du patrimoine 2016 (version simplifiée)',
        userUid: 75052324,
        userName: 'Kaoré - OpenAgenda'
      }
    },
    createdAt: '2018-02-13T10:01:32.000Z',
    updatedAt: '2018-02-13T10:01:32.000Z',
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 56678,
    creatorInboxUser: {
      id: 58149,
      inboxId: 56678,
      userUid: 99999999,
      leftAt: null,
      uid: 99999999,
      name: 'Romain Lange - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
    },
    creatorInbox: {
      id: 56678,
      type: 'agenda',
      identifier: 91362789,
      uid: 91362789,
      name: 'Journées européennes du patrimoine 2016 (version simplifiée)',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 137,
      conversationId: 82,
      body: 'Salut Kaoré !',
      createdAt: '2018-02-13T10:01:32.000Z',
      inboxUser: {
        id: 58149,
        inboxId: 56678,
        userUid: 99999999,
        leftAt: null,
        uid: 99999999,
        name: 'Romain Lange - OpenAgenda',
        avatar: 'https://cibuldev.s3.amazonaws.com/profile99999999.jpg'
      },
      inbox: {
        id: 56678,
        type: 'agenda',
        identifier: 91362789,
        uid: 91362789,
        name: 'Journées européennes du patrimoine 2016 (version simplifiée)',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 56678,
        type: 'agenda',
        identifier: 91362789,
        uid: 91362789,
        name: 'Journées européennes du patrimoine 2016 (version simplifiée)',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'support',
  creator: true,
  user: userBertho,
  conversation: {
    id: 116,
    type: 'support',
    typeIdentifier: null,
    store: {
      params: {}
    },
    createdAt: '2018-02-15T09:46:48.000Z',
    updatedAt: '2018-02-15T09:46:48.000Z',
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 3204,
    creatorInboxUser: {
      id: 1540,
      inboxId: 3204,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    creatorInbox: {
      id: 3204,
      type: 'user',
      identifier: 31046551,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    inboxUser: {
      id: 1540,
      inboxId: 3204,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 190,
      conversationId: 116,
      body: 'Salut le support !',
      createdAt: '2018-02-15T09:46:48.000Z',
      inboxUser: {
        id: 1540,
        inboxId: 3204,
        userUid: 31046551,
        leftAt: null,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      inbox: {
        id: 3204,
        type: 'user',
        identifier: 31046551,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 3204,
        type: 'user',
        identifier: 31046551,
        uid: 31046551,
        name: 'Kévin Berthommier - OpenAgenda',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      {
        id: 68902,
        type: 'support',
        identifier: 1,
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
}, {
  type: 'support',
  creator: false,
  user: userBertho,
  conversation: {
    id: 117,
    type: 'support',
    typeIdentifier: null,
    store: {
      params: {}
    },
    createdAt: '2018-02-15T10:36:20.000Z',
    updatedAt: '2018-02-15T10:36:20.000Z',
    resolvedAt: null,
    closedAt: null,
    inboxContextId: 68902,
    creatorInbox: {
      id: 68893,
      type: 'user',
      identifier: 4752166,
      uid: 4752166,
      name: 'Déborah Le Bovic',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    inboxUser: {
      id: 73788,
      inboxId: 68902,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    latestMessage: {
      id: 191,
      conversationId: 117,
      body: 'ferhsqgufizegquseq',
      createdAt: '2018-02-15T10:36:20.000Z',
      inbox: {
        id: 68893,
        type: 'user',
        identifier: 4752166,
        uid: 4752166,
        name: 'Déborah Le Bovic',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    },
    inboxes: [
      {
        id: 68893,
        type: 'user',
        identifier: 4752166,
        uid: 4752166,
        name: 'Déborah Le Bovic',
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      },
      {
        id: 68902,
        type: 'support',
        identifier: 1,
        avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    ]
  }
} ];
