import qs from 'qs';
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import classNames from 'classnames';
import upperFirst from 'lodash/upperFirst';
import { Base64 } from 'js-base64';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { MoreInfo } from '@openagenda/react-shared';
import getRoleSlug from '@openagenda/members/build/getRoleSlug';
import { isSuperiorToOrEqual } from '@openagenda/members/build/compareRoles';

const roleLabel = (i18n, role) => {
  const { getLabel } = i18n;

  return getLabel(getRoleSlug(role));
};

function MemberItem({
  user,
  member,
  agenda,
  showModal,
  resendInvitation,
  i18n,
  userRole,
  patchRole,
}) {
  const {
    id,
    invited,
    deletedUser,
    eventCount,
    custom,
    user: memberUser,
    role,
  } = member;

  const location = useLocation();
  const { getLabel } = i18n;

  const canEditMember = isSuperiorToOrEqual(userRole, role);

  const memberType = (() => {
    if (invited && !deletedUser) return 'invited';
    if (role === 1 && eventCount === 0) return 'noContrib';
    if (deletedUser && !invited) return 'deleted';
  })();

  const base64url = Base64.encode(location.pathname + location.search);

  const resendInvitationHandler = () => resendInvitation(agenda, id)
    .then(() => showModal('memberReinvited', { member, success: true }))
    .catch(() => showModal('memberReinvited', { member, success: false }));

  return (
    <div key={id} className="bo-list-item media">
      <div className="media-body">
        <div className="title media-heading">
          <strong>
            {custom.contactName
              || (memberUser && memberUser.fullName)
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
            className="btn btn-link padding-left-z padding-top-z"
          >
            {eventCount}{' '}
            {getLabel(eventCount && eventCount > 1 ? 'events' : 'event')}
          </Link>

          {canEditMember && (
            <button
              type="button"
              className="btn btn-link padding-left-z padding-top-z"
              onClick={() => showModal('editMember', { member })}
            >
              {getLabel('editProfile')}
            </button>
          )}
          {user?.uid !== member.userUid ? (
            <a
              className="btn btn-link padding-left-z padding-top-z"
              href={`/${agenda.slug}/admin/members/${id}/contact?creationRedirect=${base64url}`}
            >
              {getLabel('sendAMessage')}
            </a>
          ) : null}
          {userRole === 2 || (userRole === 3 && role === 1) ? (
            <>
              <button
                type="button"
                className="btn btn-link padding-left-z padding-top-z"
                onClick={() => showModal('removeMember', { member })}
              >
                {getLabel('removeMember')}
              </button>
              {userRole !== 3 ? (
                <Dropdown
                  id={`member-${member.userUid}-change-role`}
                  className="btn-link-dropdown"
                >
                  <Dropdown.Toggle
                    className="btn-link padding-left-z padding-top-z"
                    bsRole="toggle"
                  >
                    {getLabel('changeRole')}
                  </Dropdown.Toggle>
                  <Dropdown.Menu bsRole="menu">
                    <MenuItem
                      eventKey="administator"
                      disabled={role === 2}
                      onClick={() => patchRole('administrator')}
                    >
                      <div className="margin-h-sm margin-v-xs">
                        {getLabel('administrator')}
                      </div>
                    </MenuItem>
                    {agenda.credentials.moderators ? (
                      <MenuItem
                        eventKey="moderator"
                        disabled={userRole !== 2 || role === 3}
                        onClick={() => patchRole('moderator')}
                      >
                        <div className="margin-h-sm margin-v-xs">
                          {getLabel('moderator')}
                        </div>
                      </MenuItem>
                    ) : null}
                    <MenuItem
                      eventKey="contributor"
                      disabled={role === 1}
                      onClick={() => patchRole('contributor')}
                    >
                      <div className="margin-h-sm margin-v-xs">
                        {getLabel('contributor')}
                      </div>
                    </MenuItem>
                  </Dropdown.Menu>
                </Dropdown>
              ) : null}
            </>
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
