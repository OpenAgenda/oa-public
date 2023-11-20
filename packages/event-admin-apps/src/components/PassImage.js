import { defineMessages, useIntl } from 'react-intl';
import { css } from '@emotion/react';

const messages = defineMessages({
  linked: {
    id: 'EventAdminApp.PassImage.link',
    defaultMessage: 'This sheet is linked to a pass Culture offer',
  },
  see: {
    id: 'EventAdminApp.PassImage.see',
    defaultMessage: 'See',
  },
  edit: {
    id: 'EventAdminApp.PassImage.edit',
    defaultMessage: 'Edit',
  },
});

export default function PassImage({
  passId,
  passRes,
  passTabIsOpen,
  setPassTab,
  eventUid,
}) {
  const intl = useIntl();
  const seeLink = passRes.show.replace(':id', passId);
  const editLink = passRes.edit.replace(':id', passId);

  return (
    <span
      className={passTabIsOpen ? 'badge badge-default margin-left-xs' : 'margin-left-xs'}
      css={css`
      padding: 1px 6px 1px 1px;
      border-radius: 15px;
      `}
    >
      <img
        src="https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-22.png"
        alt="logoPassCulture"
        title={intl.formatMessage(messages.linked)}
        onClick={() => setPassTab(passTabIsOpen ? null : eventUid) }
      />
      {passTabIsOpen ? (
        <span>
          <a className="margin-left-xs" href={seeLink}>{intl.formatMessage(messages.see)}</a> - <a href={editLink}>{intl.formatMessage(messages.edit)}</a>
        </span>
      ) : null }
    </span>
  );
}
