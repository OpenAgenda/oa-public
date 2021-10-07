import qs from 'qs';
import React from 'react';
import { MoreInfo } from '@openagenda/react-components';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import upperFirst from 'lodash/upperFirst';
import { Base64 } from 'js-base64';
import getRoleSlug from '@openagenda/members/build/getRoleSlug';

const roleLabel = (i18n, role) => {
  const { getLabel } = i18n;

  return getLabel(getRoleSlug(role));
};

function MemberItem({
  member,
  agenda,
  showModal,
  resendInvitation,
  history,
  i18n,
}) {
  const {
    id,
    invited,
    deletedUser,
    eventCount,
    custom,
    user,
    owner,
    role,
  } = member;

  const { getLabel } = i18n;

  const memberType = (() => {
    if (invited && !deletedUser) return 'invited';
    if (role === 1 && eventCount === 0) return 'noContrib';
    if (deletedUser && !invited) return 'deleted';
  })();

  const base64url = Base64.encode(
    history.location.pathname + history.location.search
  );

  const resendInvitationHandler = () => resendInvitation(agenda, id)
    .then(() => showModal('memberReinvited', { member, success: true }))
    .catch(() => showModal('memberReinvited', { member, success: false }));

  return (
    <div key={id} className="bo-list-item media">
      <div className="media-body">
        <div className="title media-heading">
          <strong>
            {custom.contactName
              || (user && user.fullName)
              || (invited
                ? custom.email || getLabel('invited')
                : getLabel('noName'))}
          </strong>{' '}
          <span className="text-muted small">{roleLabel(i18n, role)}</span>{' '}
          <MoreInfo
            id={`moreinfo-${id}`}
            content={getLabel(`moreinfo${upperFirst(memberType)}`)}
          >
            <span
              className={classNames('badge', 'badge-sm', {
                'badge-info': memberType === 'invited',
                'badge-default': memberType === 'inactive',
                'badge-success': memberType === 'active',
                'badge-warning': ['deleted', 'noContrib'].includes(memberType),
              })}
            >
              {/* {stakeholderType === 'active' && getLabel( 'active' )} */}
              {memberType === 'noContrib' && getLabel('noContrib')}
              {memberType === 'invited' && getLabel('invited')}
              {memberType === 'deleted' && getLabel('deleted')}
            </span>
          </MoreInfo>
        </div>
        <div className="actions">
          {(custom.organization || custom.contactPosition) && (
            <p>
              {
                <span className="text-muted">
                  {custom.organization || null}
                </span>
              }
              {custom.organization && custom.contactPosition && ' - '}
              {
                <span className="text-muted">
                  {custom.contactPosition || null}
                </span>
              }
            </p>
          )}
          {!invited && (custom.email || custom.contactNumber) && (
            <p>
              {<span className="text-muted">{custom.email || null}</span>}
              {custom.email && custom.contactNumber && ' - '}
              {
                <span className="text-muted">
                  {custom.contactNumber || null}
                </span>
              }
            </p>
          )}

          <Link
            to={`/${agenda.slug}/admin/events?${qs.stringify({
              contributorId: id,
              'q.memberUid': [member.userUid],
            })}`}
            className="text-muted"
          >
            {/* <span className="badge badge-info"> */}
            {eventCount}{' '}
            {getLabel(eventCount && eventCount > 1 ? 'events' : 'event')}
            {/* </span> */}
          </Link>

          {(role !== 3 || ![2, 3].includes(role)) && (
            <button
              type="button"
              className="btn btn-link text-muted margin-left-sm"
              onClick={() => showModal('editMember', { member })}
            >
              {getLabel('editProfile')}
            </button>
          )}
          {!owner && (role !== 3 || ![2, 3].includes(role)) && (
            <button
              type="button"
              className="btn btn-link text-muted margin-left-sm"
              onClick={() => showModal('removeMember', { member })}
            >
              {getLabel('removeMember')}
            </button>
          )}
          {user && id !== member.id ? (
            <a
              className="text-muted margin-left-sm"
              href={`/${agenda.slug}/admin/members/${id}/contact?creationRedirect=${base64url}`}
            >
              {getLabel('sendAMessage')}
            </a>
          ) : null}
          {invited && (
            <button
              type="button"
              onClick={resendInvitationHandler}
              className="btn btn-link text-muted margin-left-sm"
            >
              {getLabel('resendInvitation')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberItem;
