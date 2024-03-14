import { defineMessages, useIntl } from 'react-intl';
import { css } from '@emotion/react';

const messages = defineMessages({
  linked: {
    id: 'EventAdminApp.PassImage.link',
    defaultMessage: 'This sheet is linked to a pass Culture offer',
  },
  linkedPending: {
    id: 'EventAdminApp.PassImage.linkPending',
    defaultMessage: 'This sheet is linked to a pending pass Culture offer',
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
  pending,
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
      className="badge badge-default margin-left-xs"
      css={passTabIsOpen ? css`
      padding: 0px 6px 0px 1px;
      border-radius: 15px;
      cursor: pointer;
      ` : css`
      padding: 0px 6px 0px 1px;
      cursor: pointer;
      border-radius: 15px;
      border-color: transparent;
      `}
    >
      <img
        src={pending ? "https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-pending-22.png" : "https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-22.png"}
        alt="logoPassCulture"
        title={pending ? intl.formatMessage(messages.linkedPending) : intl.formatMessage(messages.linked)}
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
