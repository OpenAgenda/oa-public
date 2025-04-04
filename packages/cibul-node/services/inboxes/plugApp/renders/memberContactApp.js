import _ from 'lodash';
import logs from '@openagenda/logs';
import labels from '@openagenda/labels/inboxes/index.js';
import makeLabelGetter from '@openagenda/labels';

const getLabel = makeLabelGetter(labels);

const log = logs('services/inboxes/memberContactApp');

const getCreationRedirect = (agenda, query) => {
  const defaultRedirect = `/agendas/${agenda.uid}/admin/members`;
  if (!query.creationRedirect) {
    return defaultRedirect;
  }
  return Buffer.from(query.creationRedirect, 'base64').toString().split('?')[1]
    ? `/agendas/${agenda.uid}/admin/members?${Buffer.from(query.creationRedirect, 'base64').toString().split('?')[1]}`
    : defaultRedirect;
};

export default ({ services, config, render }) =>
  (req, res, next) => {
    log('processing');
    const { members } = services;

    const targetIsAdminMod = members.utils.compareRoles.isSuperiorToOrEqual(
      req.targetMember.role,
      'moderator',
    );

    const userName = _.get(
      req.targetMember,
      'custom.contactName',
      req.targetMember.user.fullName,
    );

    log(
      'loaded targetted member %s. Is %s',
      userName,
      targetIsAdminMod ? 'adminmod' : 'not adminmod',
    );

    render({
      template: 'agenda/inbox',
      baseData: {
        event: {
          backLink: `/${req.agenda.slug}`,
        },
        image: req.agenda.image,
        title: req.agenda.title,
      },
      endpoint: targetIsAdminMod
        ? '/home/inbox'
        : `/agendas/${req.agenda.uid}/inbox`,
      initialState: {
        user: req.user,
        settings: {
          context: 'agenda',
          prefix: req.baseUrl,
          apiRoot: `http://localhost:${config.port}`,
          perPageLimit: 20,
          focusFistConversation: true, // force to display the first conversation if exists
          hideEmptyList: true, // redirect on creation if the list is empty
          allowCreateConversation: true, // show creation button
          // maskCreationSubtitle: true,
          // topListForm: true, // add a conversation form on top of conversation list
          creationSubtitle: getLabel(
            'contactName',
            { name: userName },
            req.lang,
          ),
          // creationDesc: getLabel( 'sendMessageToName', { name: req.stakeholder.user.fullName }, req.lang ),
          belowMessageDesc: getLabel(
            'retrieveConversationsOnHome',
            { url: '/home/inbox' },
            req.lang,
          ),
          onConversationCreateRedirect: getCreationRedirect(
            req.agenda,
            req.query,
          ),
          onConversationCreateFlash: getLabel(
            'conversationCreationSuccess',
            req.lang,
          ),
          defaultQuery: {
            type: 'contact_member',
            typeIdentifier: req.targetMember.id,
            params: {
              agendaTitle: req.agenda.title,
              agendaUid: req.agenda.uid,
              userUid: req.targetMember.user.uid,
              userName,
            },
            destinationInbox: targetIsAdminMod
              ? {
                type: 'user',
                identifier: req.targetMember.user.uid,
              }
              : [],
          },
        },
        agenda: req.agenda,
      },
    })(req, res, next);
  };
