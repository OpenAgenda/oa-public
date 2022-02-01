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
  },
  description: {
    id: 'AgendaContribute.Member.description',
    defaultMessage: 'Your personal information will only be visible by the administration team of the agenda. Only your organisation name will be publicly displayed.'
  }
});

export default ({
  member,
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
      <div className="padding-top-md padding-bottom-sm">
        <div className="padding-bottom-sm">
          <strong>{m(messages.subtitle)}</strong>
        </div>
        <p>{m(messages.description)}</p>
      </div>
      <MemberFormComponent
        member={member}
        title={null}
        description={null}
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
