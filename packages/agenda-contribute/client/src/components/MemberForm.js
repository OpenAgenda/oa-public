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
  lang,
  memberUserUid,
  res,
  role,
  onSuccess
}) => {
  const m = useIntl().formatMessage;

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
        title={null}
        description={null}
        lang={lang}
        optionalFields={['administrator', 'moderator'].includes(role)}
        operation={memberUserUid ? 'update' : 'create'}
        res={memberUserUid ? res.replace(':userUid', memberUserUid) : res}
        blockButtons
        hideCancel
        onSuccess={onSuccess}
      />
    </div>
  );
};
