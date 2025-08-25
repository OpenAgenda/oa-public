import { defineMessages, useIntl } from 'react-intl';
import cn from 'classnames';

const messages = defineMessages({
  linked: {
    id: 'EventAdminApp.PassImage.link',
    defaultMessage: 'This event is linked to a pass Culture offer',
  },
  linkedPending: {
    id: 'EventAdminApp.PassImage.linkPending',
    defaultMessage: 'This event is linked to a pending pass Culture offer',
  },
  linkedRejected: {
    id: 'EventAdminApp.PassImage.linkRejected',
    defaultMessage: 'The pass Culture offer linked to the event was rejected',
  },
  linkedErrored: {
    id: 'EventAdminApp.PassImage.linkErrored',
    defaultMessage:
      'A problem occurred during the creation or update of the linked pass Culture offer. Contact support to find a resolution.',
  },
  likedUnpublished: {
    id: 'EventAdminApp.PassImage.linkUnpublished',
    defaultMessage: 'The offer will be created upon publication of the event',
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

const imgRoute = process.env.NEXT_PUBLIC_ASSETS;

const imgSource = (errored, rejected, pending, unpublished) => {
  const completedImgRoute = `${imgRoute}/svc/registration-apps/`;
  if (errored) return `${completedImgRoute}pass-culture-error-22.png`;
  if (rejected) return `${completedImgRoute}pass-culture-rejected-22.png`;
  if (pending) return `${completedImgRoute}pass-culture-pending-22.png`;
  if (unpublished) return `${completedImgRoute}pass-culture-unpublished-22.png`;
  return `${completedImgRoute}pass-culture-22.png`;
};

const title = (intl, errored, rejected, pending, unpublished) => {
  if (errored) return intl.formatMessage(messages.linkedErrored);
  if (rejected) return intl.formatMessage(messages.linkedRejected);
  if (pending) return intl.formatMessage(messages.linkedPending);
  if (unpublished) return intl.formatMessage(messages.likedUnpublished);
  return intl.formatMessage(messages.linked);
};

export default function PassImage({
  pending,
  rejected,
  errored,
  passUnpublished,
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
    <button
      type="button"
      onClick={() => setPassTab(passTabIsOpen ? null : eventUid)}
      className={cn('badge badge-default margin-left-xs pass-tab', {
        'is-open': passTabIsOpen,
      })}
    >
      <img
        src={imgSource(errored, rejected, pending, passUnpublished)}
        alt="logoPassCulture"
        title={title(intl, errored, rejected, pending, passUnpublished)}
      />
      {passTabIsOpen ? (
        <span>
          <a className="margin-left-xs" href={seeLink}>
            {intl.formatMessage(messages.see)}
          </a>{' '}
          - <a href={editLink}>{intl.formatMessage(messages.edit)}</a>
        </span>
      ) : null}
    </button>
  );
}
