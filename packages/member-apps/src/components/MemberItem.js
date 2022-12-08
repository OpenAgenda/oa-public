import qs from 'qs';
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import classNames from 'classnames';
import upperFirst from 'lodash/upperFirst';
import { Base64 } from 'js-base64';
import { MoreInfo, Dropdown } from '@openagenda/react-shared';
import getRoleSlug from '@openagenda/members/build/getRoleSlug';
import { isSuperiorToOrEqual } from '@openagenda/members/build/compareRoles';

const roleLabel = (i18n, role) => {
  const { getLabel } = i18n;

  return getLabel(getRoleSlug(role));
};

function MemberItemComponent({
  user,
  member,
  agenda,
  showModal,
  resendInvitation,
  i18n,
  userRole,
  patchRole,
  location,
  LinkComponent,
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

  const { getLabel } = i18n;

  const canEditMember = isSuperiorToOrEqual(userRole, role) && !invited;

  const memberType = (() => {
    if (invited && !deletedUser) return 'invited';
    if (role === 1 && eventCount === 0) return 'noContrib';
    if (deletedUser && !invited) return 'deleted';
  })();

  const base64url = Base64.encode(location?.pathname + location?.search);

  const resendInvitationHandler = () => resendInvitation(agenda, id)
    .then(() => showModal('memberReinvited', { member, success: true }))
    .catch(() => showModal('memberReinvited', { member, success: false }));

  return (
    <div key={id} className="bo-list-item media">
      <div className="media-body">
        <div className="title media-heading margin-bottom-z">
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
            <div className="margin-top-xs margin-bottom-z">
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
            </div>
          )}
          {!invited && (custom.email || custom.contactNumber) && (
            <div className="margin-top-xs margin-bottom-z">
              {<span className="text-muted">{custom.email || null}</span>}
              {custom.email && custom.contactNumber && ' - '}
              {
                <span className="text-muted">
                  {custom.contactNumber || null}
                </span>
              }
            </div>
          )}

          <LinkComponent>
            {eventCount}{' '}
            {getLabel(eventCount && eventCount > 1 ? 'events' : 'event')}
          </LinkComponent>

          {canEditMember && (
            <button
              type="button"
              className="btn btn-link padding-left-z"
              onClick={() => showModal('editMember', { member })}
            >
              {getLabel('editProfile')}
            </button>
          )}
          {user?.uid !== member.userUid && !invited ? (
            <a
              className="btn btn-link padding-left-z"
              href={`/${agenda.slug}/admin/members/${id}/contact?creationRedirect=${base64url}`}
            >
              {getLabel('sendAMessage')}
            </a>
          ) : null}
          {userRole === 2 || (userRole === 3 && role === 1) ? (
            <>
              <button
                type="button"
                className="btn btn-link padding-left-z"
                onClick={() => showModal('removeMember', { member })}
              >
                {getLabel('removeMember')}
              </button>
              {userRole !== 3 ? (
                <Dropdown
                  className="btn-link-dropdown dropdown open"
                  Trigger={props => (
                    <button
                      type="button"
                      {...props}
                      className="btn-link padding-left-z"
                    >
                      {getLabel('changeRole')}&nbsp;
                      <span className="caret" />
                    </button>
                  )}
                >
                  <ul className="list-unstyled margin-v-z">
                    {['administrator', 'moderator', 'contributor'].map(
                      targetRole => (
                        <li key={targetRole}>
                          <button
                            type="button"
                            className="btn btn-link btn-block"
                            onClick={() => patchRole(targetRole)}
                          >
                            {getLabel(targetRole)}
                          </button>
                        </li>
                      )
                    )}
                  </ul>
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

function MemberItem(props) {
  const location = useLocation();

  const { agenda, member } = props;

  return (
    <MemberItemComponent
      {...props}
      location={location}
      LinkComponent={({ children }) => (
        <Link
          to={`/${agenda.slug}/admin/events?${qs.stringify({
            contributorId: member.id,
            'q.memberUid': [member.userUid],
          })}`}
          className="btn btn-link padding-left-z"
        >
          {children}
        </Link>
      )}
    />
  );
}

MemberItem.Component = MemberItemComponent;

export default MemberItem;
