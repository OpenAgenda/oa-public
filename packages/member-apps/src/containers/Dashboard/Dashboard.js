/* global __CLIENT__ */

import React, { Component } from 'react';
import { provideHooks } from 'redial';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Form, Field } from 'react-final-form';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import upperFirst from 'lodash/upperFirst';
import { Button, DropdownButton, MenuItem } from 'react-bootstrap';
import { Base64 } from 'js-base64';
import qs from 'qs';

import withContext from '@openagenda/react-utils/dist/withContext';
import getRoleSlug from '@openagenda/members/build/getRoleSlug';
import monitorBottomHit from '@openagenda/dom-utils/monitorBottomHit';
import Modal from '@openagenda/react-components/build/Modal';
import MoreInfo from '@openagenda/react-components/build/MoreInfo';
import Spinner from '@openagenda/react-form-components/build/Spinner';
import openRequestForm from '@openagenda/call-to-action/dist/openRequestForm';

import InviteMembersForm from '../../components/InviteMembersForm/InviteMembersForm';
import EditMemberForm from '../../components/EditMemberForm/EditMemberForm';
import SendMessageForm from '../../components/SendMessageForm/SendMessageForm';
import * as membersActions from '../../redux/modules/members';
import * as modalsActions from '../../redux/modules/modals';
import { renderField, renderSearchInput } from '../../utils/form';
import I18nContext from '../../contexts/I18nContext';

function SimpleSelect({
  action, children, input, meta, ...otherProps
}) {
  const onChange = e => {
    input.onChange(e);

    if (typeof action === 'function') {
      action(e.target.name, e.target.value);
    }
  };

  return (
    <select {...input} {...otherProps} onChange={onChange}>
      {children}
    </select>
  );
}

function OrderField({ action, input, title }) {
  const onChange = value => e => {
    input.onChange(e);

    if (typeof action === 'function') {
      action(input.name, value);
    }
  };

  const onClick = onChange(input.value === 'desc' ? 'asc' : 'desc');

  return (
    <button
      type="button"
      className="btn btn-default"
      title={title}
      onClick={onClick}
    >
      <i
        className={`fa fa-sort-amount-${
          input.value === 'desc' ? 'desc' : 'asc'
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

@provideHooks({
  fetch: async ({ store: { dispatch, getState }, location }) => {
    const state = getState();
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const promises = [];

    if (!membersActions.isLoaded(state)) {
      promises.push(dispatch(membersActions.getStats()));
      promises.push(dispatch(membersActions.load(query)));
    }

    return Promise.all(__CLIENT__ ? [] : promises);
  }
})
@connect(
  (state, props) => {
    const query = qs.parse(props.location.search, { ignoreQueryPrefix: true });

    return {
      query,
      res: state.res,
      credentials: state.agenda.credentials,
      userShId: state.member.id,
      userCredential: state.member.role,
      members: state.members.data,
      page: state.members.page,
      total: state.members.total,
      loading: state.members.loading,
      nextLoading: state.members.nextLoading,
      credFilters: state.members.credFilters,
      showInviteResult: state.members.showInviteResult,
      inviteError: state.members.inviteError,
      stats: state.members.stats || {},
      agenda: state.agenda,
      perPageLimit: state.settings.perPageLimit,
      modals: state.modals,
      roles: state.agenda.roles
    };
  },
  { ...membersActions, ...modalsActions }
)
@withRouter
class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.renderField = this::renderField;
    this.renderSearchInput = this::renderSearchInput;

    this.debouncedSearch = debounce(this.search, 400);
  }

  componentDidMount() {
    monitorBottomHit(throttle(this.nextPage, 400, { trailing: false }));
  }

  componentWillUnmount() {
    monitorBottomHit.stop();
  }

  addFilter = (e, key) => {
    e.preventDefault();

    const { addCredFilter, search } = this.props;
    addCredFilter(key);
    this.forceUpdate(() => this.search({ search }));
  };

  removeFilter = (e, key) => {
    e.preventDefault();

    const { removeCredFilter, search } = this.props;
    removeCredFilter(key);
    this.forceUpdate(() => this.search({ search }));
  };

  // cleanFilters = e => {
  //   e.preventDefault();
  //
  //   const { cleanCredFilters, search } = this.props;
  //   cleanCredFilters();
  //   this.forceUpdate(() => this.search({ search }));
  // }

  roleLabel = role => {
    const {
      i18n: { getLabel }
    } = this.props;

    return getLabel(getRoleSlug(role));
  };

  nextPage = () => {
    const {
      page,
      total,
      search,
      credFilters,
      loading,
      nextLoading,
      members,
      perPageLimit,
      nextPage
    } = this.props;
    if (
      !members
      || !members.length
      || loading
      || nextLoading
      || page * perPageLimit >= total
    ) {
      return;
    }
    nextPage(
      { search: search || undefined, role: credFilters },
      (page || 1) + 1
    );
  };

  search = ({ search, sortBy, sortOrder }) => {
    const {
      list, location, credFilters, history
    } = this.props;

    const order = sortBy && sortOrder ? `${sortBy}.${sortOrder}` : undefined;
    const query = { search: search || undefined, role: credFilters, order };

    return list(query).then(() => history.push({
      ...location,
      search: qs.stringify(query, { arrayFormat: 'brackets' })
    }));
  };

  renderMember(member) {
    const {
      id,
      role,
      invited,
      custom,
      eventCount,
      user,
      deletedUser,
      owner
    } = member;
    const {
      res,
      showModal,
      userShId,
      userRole,
      resendInvitation,
      location,
      agenda,
      i18n
    } = this.props;
    const { getLabel } = i18n;

    const memberType = (() => {
      if (invited && !deletedUser) return 'invited';
      if (role === 1 && eventCount === 0) return 'noContrib';
      if (deletedUser && !invited) return 'deleted';
    })();

    const base64url = Base64.encode(location.pathname + location.search);

    const resendInvitationHandler = () => resendInvitation(id)
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
            <span className="text-muted small">{this.roleLabel(role)}</span>{' '}
            <MoreInfo
              id={`moreinfo-${id}`}
              content={getLabel(`moreinfo${upperFirst(memberType)}`)}
            >
              <span
                className={classNames('badge', 'badge-sm', {
                  'badge-info': memberType === 'invited',
                  'badge-default': memberType === 'inactive',
                  'badge-success': memberType === 'active',
                  'badge-warning': ['deleted', 'noContrib'].includes(memberType)
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

            <a
              href={res.showContributor.replace(':contributorId', id)}
              className="text-muted"
            >
              {/* <span className="badge badge-info"> */}
              {eventCount}{' '}
              {getLabel(eventCount && eventCount > 1 ? 'events' : 'event')}
              {/* </span> */}
            </a>
            {(userRole !== 3 || ![2, 3].includes(role)) && (
              <button
                type="button"
                className="btn btn-link text-muted"
                onClick={() => showModal('editMember', { member })}
              >
                {getLabel('editProfile')}
              </button>
            )}
            {!owner && (userRole !== 3 || ![2, 3].includes(role)) && (
              <button
                type="button"
                className="btn btn-link text-muted"
                onClick={() => showModal('removeMember', { member })}
              >
                {getLabel('removeMember')}
              </button>
            )}
            {user && id !== userShId ? (
              <a
                className="text-muted"
                href={`/${agenda.slug}/admin/members/${id}/contact?creationRedirect=${base64url}`}
              >
                {getLabel('sendAMessage')}
              </a>
            ) : null}
            {invited && (
              <button
                type="button"
                onClick={resendInvitationHandler}
                className="btn btn-link text-muted"
              >
                {getLabel('resendInvitation')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  renderFilter(nbr, key) {
    const { i18n, credFilters /* , credentials, agenda */ } = this.props;
    const { getLabel } = i18n;

    const label = key + (nbr > 1 ? 's' : '');

    const toggleFilter = e => (credFilters.includes(key) ? this.removeFilter : this.addFilter)(e, key);

    /* if ( key === 'moderator' && !credentials.moderators ) {

      return (
        <li role="presentation" className="locked">
          <a href="#" onClick={() => openRequestForm( { lang, subject: 'moderators', agenda: agenda.slug } )}>
            {nbr && <strong>{nbr || 0}</strong>}{' '}{getLabel( label )}{' '}
            <i className="fa fa-unlock-alt" aria-hidden="true"></i>
          </a>
        </li>
      );

    } */

    if (!nbr) return null;

    const active = credFilters.includes(key);

    return (
      <li role="presentation" className={classNames({ active })}>
        {/* eslint-disable-next-line */}
        <a href="#" type="button" className="nav-link" onClick={toggleFilter}>
          <strong>{nbr || 0}</strong> {getLabel(label)}{' '}
          <i
            className={classNames('fa fa-times', {
              invisible: !active
            })}
          />
        </a>
      </li>
    );
  }

  render() {
    const {
      res,
      members,
      total,
      loading,
      nextLoading,
      stats,
      search,
      getStats,
      showModal,
      closeModal,
      setModal,
      modals,
      update,
      invite,
      remove,
      sendMessage,
      credFilters,
      showInviteResult,
      cleanInviteResult,
      inviteError,
      credentials,
      agenda,
      query,
      i18n
    } = this.props;
    const { getLabel, lang } = i18n;

    const {
      administrator: totalAdministrator,
      moderator: totalModerator,
      contributor: totalContributor,
      reader: totalReader
    } = stats.totalPerRole || {};

    const editModal = modals.editMember || {};
    const removeModal = modals.removeMember || {};
    const inviteMembersModal = modals.inviteMembers || {};
    const memberReinvitedModal = modals.memberReinvited || {};
    const writeToMembersModal = modals.writeToMembers || {};

    return (
      <div>
        <h2>
          {getLabel('members')}

          <div className="pull-right">
            <div className="btn-group">
              <DropdownButton
                title={getLabel('export')}
                id="nested-export-dropdown"
              >
                <MenuItem href={res.exportToXlsx}>XLSX</MenuItem>
                <MenuItem href={res.exportToCsv}>CSV</MenuItem>
              </DropdownButton>

              <Button onClick={() => showModal('inviteMembers')}>
                {getLabel('invite')}
              </Button>

              {!credentials.invitationMessage && (
                <DropdownButton
                  id="nested-more-dropdown"
                  title={<i className="fa fa-ellipsis-v" aria-hidden="true" />}
                  pullRight
                  noCaret
                >
                  <MenuItem
                    onClick={() => openRequestForm({
                      lang,
                      subject: 'moderators',
                      agenda: agenda.slug
                    })}
                  >
                    <i className="golden-icon" /> {getLabel('nameModerators')}
                  </MenuItem>
                </DropdownButton>
              )}
            </div>
          </div>
        </h2>

        <ul className="nav nav-pills" role="tablist">
          {/* <li role="presentation" className={classNames( { active: !credFilters.length } )}>
            <a href="#" onClick={e => this.cleanFilters( e )}>
              <strong>{stats.total || 0}</strong> Total{' '}
              <i className={classNames( 'fa fa-times', { invisible: credFilters.length } )} aria-hidden="true"></i>
            </a>
          </li> */}
          {this.renderFilter(totalAdministrator, 'administrator')}
          {this.renderFilter(totalModerator, 'moderator')}
          {this.renderFilter(totalContributor, 'contributor')}
          {this.renderFilter(totalReader, 'reader')}
        </ul>

        <Form
          initialValues={{
            search: query.search || '',
            sortBy: 'id',
            sortOrder: 'asc'
          }}
          onSubmit={this.search}
          subscription={{ values: true }}
          render={({ handleSubmit, form }) => (
            <form onSubmit={handleSubmit}>
              <Field
                component={this.renderSearchInput}
                name="search"
                type="text"
                classNameGroup="search margin-v-sm"
                className="form-control"
                placeholder={getLabel('searchMember')}
                action={() => this.debouncedSearch(form.getState().values)}
                loading={loading}
              />

              <div className="text-right form-group form-inline">
                Trié par{' '}
                <Field
                  name="sortBy"
                  className="form-control"
                  type="select"
                  component={SimpleSelect}
                  action={() => this.search(form.getState().values)}
                >
                  <option value="id">{getLabel('order.arrivalDate')}</option>
                  <option value="slug">{getLabel('order.name')}</option>
                  <option value="actionsCounter">
                    {getLabel('order.activity')}
                  </option>
                </Field>{' '}
                <Field
                  name="sortOrder"
                  title={getLabel('orderSort')}
                  component={OrderField}
                  type="text"
                  action={(name, value) => {
                    form.change(name, value);
                    this.search(form.getState().values);
                  }}
                />
              </div>
            </form>
          )}
        />

        {/* total > 0 && <div className="margin-v-md">
          {getLabel( 'result' )}: {total} {getLabel( 'members' ).toLowerCase()}
        </div> */}

        <div className="margin-v-md">
          {getLabel('total')}: <strong>{stats.total || 0}</strong>
          {// if there is a search or filter(s)
          (total > 0 && total < (stats.total || 0)) // if total differ of 0 or stats.total
          || (((credFilters && credFilters.length)
            || (!!search && search === query.search))
            && !loading) ? (
              <span className="margin-left-sm">
                {getLabel('result')}: <strong>{total}</strong>{' '}
                {getLabel(total <= 1 ? 'member' : 'members').toLowerCase()}
              </span>
            ) : null
}
          {total > 0 ? (
            <button
              type="button"
              className="btn btn-default btn-medium margin-left-sm"
              onClick={() => {
                if (credentials.invitationMessage) {
                  return showModal('writeToMembers', {
                    query: { search: search || undefined, role: credFilters }
                  });
                }
                return openRequestForm({
                  lang,
                  subject: 'writeToAll',
                  agenda: agenda.slug
                });
              }}
            >
              {credentials.invitationMessage ? null : (
                <>
                  <i className="golden-icon" />{' '}
                </>
              )}
              {getLabel(total > 1 ? 'writeToThem' : 'writeToHim')}
            </button>
          ) : null}
        </div>

        <div>
          {members && members.map(s => this.renderMember(s))}

          {!members || !members.length ? (
            <div className="text-center text-muted margin-v-md">
              {getLabel('noResult')}
            </div>
          ) : null}

          {nextLoading && (
            <div className="padding-v-md" style={{ position: 'relative' }}>
              <Spinner />
            </div>
          )}
        </div>

        {editModal.visible && (
          <Modal
            title={getLabel('editProfile')}
            onClose={() => closeModal('editMember')}
          >
            <EditMemberForm
              member={editModal.member}
              onSubmit={(...params) => update(editModal.member.id, ...params).then(async result => {
                closeModal('editMember');

                await getStats();

                return result;
              })}
            />
          </Modal>
        )}

        {removeModal.visible && (
          <Modal
            title={getLabel('removeMember')}
            visible={removeModal.visible || false}
            onClose={() => closeModal('removeMember')}
          >
            {removeModal.error ? (
              <div className="text-center">
                <div className="margin-v-sm">
                  {getLabel('removeModalError')}
                </div>

                <button
                  type="button"
                  onClick={() => closeModal('removeMember')}
                  className="btn btn-danger"
                >
                  {getLabel('close')}
                </button>
              </div>
            ) : (
              <div>
                <p className="margin-top-sm">
                  {getLabel('removeConfirmMessage')}
                </p>
                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => remove(removeModal.member.id)
                      .then(() => closeModal('removeMember'))
                      .catch(() => setModal('removeMember', { error: true }))}
                  >
                    {getLabel('removeMember')}
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}

        {inviteMembersModal.visible && (
          <Modal
            title={getLabel('inviteMembers')}
            onClose={() => {
              closeModal('inviteMembers');
              cleanInviteResult();
            }}
            classNames={{
              overlay: 'popup-overlay big'
            }}
            disableBodyScroll
          >
            {showInviteResult ? (
              <div>
                {inviteError ? (
                  <div>
                    {inviteError.emailsRejected
                    && inviteError.emailsRejected.length ? (
                      <div>
                        {getLabel('emailsCouldNotBeInvited')}{' '}
                        <b>{inviteError.emailsRejected.join(', ')}</b>
                      </div>
                      ) : (
                        <div>{getLabel('invitationProblem')}</div>
                      )}
                  </div>
                ) : (
                  <div>{getLabel('membersInvited')}</div>
                )}
              </div>
            ) : (
              <InviteMembersForm
                onSubmit={data => invite(data).then(async result => {
                  await this.search({ search });
                  await getStats();
                  return result;
                })}
              />
            )}
          </Modal>
        )}

        {memberReinvitedModal.visible && (
          <Modal
            title={getLabel('inviteMembers')}
            onClose={() => {
              closeModal('memberReinvited');
            }}
          >
            {memberReinvitedModal.success ? (
              <div>{getLabel('invitationResended')}</div>
            ) : (
              <div>{getLabel('invitationNotResended')}</div>
            )}
          </Modal>
        )}

        {writeToMembersModal.visible && (
          <Modal
            title={getLabel('sendMessageToMembers')}
            visible={writeToMembersModal.visible || false}
            onClose={() => closeModal('writeToMembers')}
            classNames={{
              overlay: 'popup-overlay big'
            }}
          >
            {!writeToMembersModal.confirmation ? (
              <SendMessageForm
                onSubmit={data => sendMessage(data, writeToMembersModal.query).then(() => setModal('writeToMembers', { confirmation: true }))}
              />
            ) : (
              <div className="text-center">
                <div className="margin-v-sm">{getLabel('messageSent')}</div>

                <button
                  type="button"
                  onClick={() => closeModal('writeToMembers')}
                  className="btn btn-danger"
                >
                  {getLabel('close')}
                </button>
              </div>
            )}
          </Modal>
        )}
      </div>
    );
  }
}

export default withContext(I18nContext, 'i18n')(Dashboard);
