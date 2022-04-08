import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import MemberFormComponent from '@openagenda/member-apps/dist/components/Form';

const messages = defineMessages({
  title: {
    id: 'AgendaContribute.Member.title',
    defaultMessage: 'Welcome !'
  },
  subtitle: {
    id: 'AgendaContribute.Member.subtitle',
    defaultMessage: 'Present yourself to the agenda administrators before starting typing your events'
  }
});

export default ({
  member,
  agenda,
  res,
  role,
  onSuccess
}) => {
  const intl = useIntl();

  const {
    formatMessage: m,
    locale
  } = intl;

  return (
    <div>
      <h3>{m(messages.title)}</h3>
      <strong>{m(messages.subtitle)}</strong>
      <MemberFormComponent
        member={member}
        title={null}
        GDPR={{
          display: true,
          moreInfo: agenda.settings?.contribution?.messages?.GDPRInformation
        }}
        lang={locale}
        optionalFields={['administrator', 'moderator'].includes(role)}
        operation={member ? 'update' : 'create'}
        res={member ? `${res}/${member.userUid}` : res}
        blockButtons
        hideCancel
        onSuccess={onSuccess}
      />
    </div>
  );
};
