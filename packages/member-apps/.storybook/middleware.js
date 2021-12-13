const express = require('express');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const { utils } = require('@openagenda/members');

const membersFixtures = require('./fixtures/members.json');
const member = require('./fixtures/member.json');
const otherMember = require('./fixtures/otherMember.json');

const memberListResult = {
  ...membersFixtures,
  members: membersFixtures.members.concat([]),
};

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

module.exports = router => {
  if (['development', 'test'].includes(process.env.NODE_ENV)) {
    router.use(morgan('dev'));
  }

  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));

  router.use((req, res, next) => {
    req.user = {
      id: 2,
      lang: req.query.lang || 'fr',
    }; // 2 == administrator, 4387 == contributor
    req.identifiers = { userId: req.user.id };
    req.agenda = { id: 4608 };
    next();
  });

  router.use((req, res, next) => {
    req.agenda = {
      uid: 1938,
      title: 'Un agenda',
    };
    next();
  });

  router.use((req, res, next) => {
    req.member = {
      id: 1,
      userUid: 123,
      agendaUid: 1234,
      custom: {},
    };
    next();
  });

  router.use((req, res, next) => {
    req.roles = [
      {
        code: 1,
        slug: 'contributor',
      },
      {
        code: 2,
        slug: 'administrator',
      },
      {
        code: 3,
        slug: 'moderator',
      },
    ];
    next();
  });

  router.get('/members.json', (req, res) => {
    const { search } = req.query;

    if (!search) {
      return res.json(memberListResult);
    }

    const reg = new RegExp(search, 'i');

    const members = memberListResult.members.filter(
      v => (v.custom.contactName && v.custom.contactName.match(reg))
        || (v.user.fullName && v.user.fullName.match(reg))
    );
    const total = members.length;

    res.json({
      members,
      total,
    });
  });

  router.get('/stats', (req, res) => res.json({
    total: 17,
    totalPerRole: {
      contributor: 14,
      administrator: 3,
    },
  }));

  router.patch(
    '/update/:id',
    (req, res, next) => {
      req.result = {
        role: 2,
        custom: {
          contactName: 'Server result member name',
          organization: 'Members Org',
        },
        errors: [],
      };
      next();
    },
    ({ result }, res) => res.status(result.errors.length ? 400 : 200).json(result)
  );

  router.post('/invite', (req, res) => {
    res.json({ queued: true, emailsRejected: [], success: true });
  });

  router.post('/send-message', (req, res) => res.json({ success: true }));

  router.post('/send-a-message/:id', (req, res) => {
    res.json({ success: true });
  });

  router.get('/api/agendas/123/members/456', (req, res) => {
    res.json(member);
  });

  router.get('/api/agendas/123/members/789', (req, res) => {
    res.json(otherMember);
  });

  router.post('/api/agendas/123/members', (req, res) => {
    // eslint-disable-next-line no-console
    console.log('received %j', req.body);
    res.status(200).send();
  });

  router.patch('/api/agendas/:agendaUid/members/:userUid', (req, res) => {
    // eslint-disable-next-line no-console
    console.log('received %j', req.body);

    const memberIndex = memberListResult.members.findIndex(
      m => m.userUid === parseInt(req.params.userUid, 10)
    );

    let data;
    if (typeof req.body.data === 'string') {
      data = JSON.parse(req.body.data);
    } else {
      data = req.body;
    }

    const map = {
      name: 'contactName',
      phone: 'contactNumber',
      position: 'contactPosition',
      organization: 'organization',
      email: 'email',
    };

    const customData = Object.keys(map).reduce(
      (carry, key) => ({
        ...carry,
        [map[key]]: data[key],
      }),
      {}
    );

    if (Object.keys(customData).length) {
      memberListResult.members[memberIndex].custom = customData;
    }

    if (data.role) {
      memberListResult.members[memberIndex].role = utils.getRoleCode(data.role);
    }

    res.status(200).json(data);
  });

  router.get('/api/agendas/:agendaUid/members/:userUid', (req, res) => {
    const legacyFormatMember = memberListResult.members.find(
      m => m.userUid === parseInt(req.params.userUid, 10)
    );

    const map = {
      contactName: 'name',
      contactNumber: 'phone',
      contactPosition: 'position',
      organization: 'organization',
      email: 'email',
    };

    res.status(200).json(
      Object.keys(map).reduce(
        (carry, key) => ({
          ...carry,
          [map[key]]: legacyFormatMember.custom[key],
        }),
        {
          userUid: legacyFormatMember.user.uid,
          role: utils.getRoleSlug(legacyFormatMember.role),
        }
      )
    );
  });

  router.delete('/api/agendas/:agendaUid/members/:userUid', (req, res) => {
    // eslint-disable-next-line no-console
    console.log('received delete request');
    res.status(204).send();
  });

  router.use(errorHandler({ log: true }));
};
