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
  linkedRejected: {
    id: 'EventAdminApp.PassImage.linkRejected',
    defaultMessage: 'This sheet is linked to a rejected pass Culture offer',
  },
  linkedErrored: {
    id: 'EventAdminApp.PassImage.linkErrored',
    defaultMessage: 'This sheet is linked to a errored pass Culture offer',
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
  rejected,
  errored,
  passId,
  passRes,
  passTabIsOpen,
  setPassTab,
  eventUid,
}) {
  const intl = useIntl();
  const seeLink = passRes.show.replace(':id', passId);
  const editLink = passRes.edit.replace(':id', passId);
  const imgSource = () => {
    if (errored) return 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-error-22.png';
    if (rejected) return 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-rejected-22.png';
    if (pending) return 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-pending-22.png';
    return 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-22.png';
  };

  const title = () => {
    if (errored) return intl.formatMessage(messages.linkedErrored);
    if (rejected) return intl.formatMessage(messages.linkedRejected);
    if (pending) return intl.formatMessage(messages.linkedPending);
    return intl.formatMessage(messages.linked);
  };

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
        src={imgSource()}
        alt="logoPassCulture"
        title={title()}
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
