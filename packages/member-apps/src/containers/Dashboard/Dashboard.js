import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect, ReactReduxContext } from 'react-redux';
import { Form, Field } from 'react-final-form';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import qs from 'qs';
import {
  withContext,
  withLayoutData,
  Modal,
  Dropdown,
  Spinner,
} from '@openagenda/react-shared';
import monitorBottomHit from '@openagenda/dom-utils/monitorBottomHit';
import HistoryModal from '@openagenda/activity-apps/dist/client/apps/modal';

import MemberItem from '../../components/MemberItem';
import MemberForm from '../../components/Form';
import InviteMembersForm from '../../components/InviteMembersForm';
import SendMessageForm from '../../components/SendMessageForm';
import * as membersActions from '../../reducers/members';
import * as modalsActions from '../../reducers/modals';
import renderSearchInput from '../../utils/renderSearchInput';
import I18nContext from '../../contexts/I18nContext';

const messages = defineMessages({
  messageHistory: {
    id: 'MemberApps.Dashboard.messageHistory',
    defaultMessage: 'Message history',
  },
  sendMessageToMembers: {
    id: 'MemberApps.Dashboard.sendMessageToMembers',
    defaultMessage: 'Send a message to the members',
  },
  sendMessageToFilteredMembers: {
    id: 'MemberApps.Dashboard.sendMessageToFilteredMembers',
    defaultMessage:
      'The message will be sent to the current selection ({count, plural, =1 {1 member} other {# members}} out of {total})',
  },
  sendMessageToUnfilteredMembers: {
    id: 'MemberApps.Dashboard.sendMessageToUnfilteredMembers',
    defaultMessage:
      'The message will be sent to {total, plural, =1 {the only member} other {all # members}} of the agenda',
  },
});

const Loading = () => (
  <div className="padding-v-md" style={{ position: 'relative' }}>
    <Spinner />
  </div>
);

function SimpleSelect({ action, children, input, meta, ...otherProps }) {
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

function HistoryModalButton({ openModal, children }) {
  return (
    <button
      type="button"
      className="btn btn-link btn-link-inline margin-left-sm"
      onClick={openModal}
    >
      {children}
    </button>
  );
}

@injectIntl
@withLayoutData('agenda', 'member', 'role', 'user')
@connect(
  (state, props) => {
    const query = qs.parse(props.location.search, {
      ignoreQueryPrefix: true,
    });

    return {
      query,
      res: state.res,
      members: state.members.data ?? [],
      patchSuccessModal: state.members.patchSuccessModal,
      page: state.members.page ?? 1,
      total: state.members.total ?? 0,
      loadLoading: state.members.loadLoading,
      listLoading: state.members.listLoading,
      nextLoading: state.members.nextLoading,
      credFilters: state.members.credFilters,
      showInviteResult: state.members.showInviteResult,
      inviteError: state.members.inviteError,
      stats: state.members.stats ?? {},
      perPageLimit: state.settings.perPageLimit,
      modals: state.modals,
      schema: state.members.schema ?? null,
    };
  },
  { ...membersActions, ...modalsActions },
)
@withContext(ReactReduxContext, 'reactReduxContext')
@withRouter
class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.renderSearchInput = renderSearchInput.bind(this);

    this.debouncedSearch = debounce(this.search, 400);
  }

  componentDidMount() {
    const { reactReduxContext, agenda, query } = this.props;
    const { store } = reactReduxContext;

    // const state = store.getState();

    // if (!membersActions.isLoaded(state)) {
    store.dispatch(membersActions.getStats(agenda)).catch(() => null);
    store.dispatch(membersActions.load(agenda, query)).catch(() => null);
    store.dispatch(membersActions.getSchema(agenda)).catch(() => null);
    // }

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

  nextPage = () => {
    const {
      agenda,
      page,
      total,
      search,
      credFilters,
      loadLoading,
      listLoading,
      nextLoading,
      members,
      perPageLimit,
      nextPage,
    } = this.props;
    if (
      !members
      || !members.length
      || loadLoading
      || listLoading
      || nextLoading
      || page * perPageLimit >= total
    ) {
      return;
    }
    nextPage(
      agenda,
      { search: search || undefined, role: credFilters },
      (page || 1) + 1,
    );
  };

  search = ({ search, sortBy, sortOrder }) => {
    const { list, agenda, credFilters, history, query } = this.props;

    const order = sortBy && sortOrder ? `${sortBy}.${sortOrder}` : undefined;
    const newQuery = {
      ...query,
      search: search || undefined,
      role: credFilters,
      order,
    };

    return list(agenda, newQuery).then(() =>
      history.push({
        search: qs.stringify(newQuery, { arrayFormat: 'brackets' }),
      }));
  };

  removeMemberFilter = () => {
    const { list, agenda, history, query } = this.props;

    const newQuery = {
      ...query,
      userUid: undefined,
    };

    return list(agenda, newQuery).then(() =>
      history.push({
        search: qs.stringify(newQuery, { arrayFormat: 'brackets' }),
      }));
  };

  renderFilter(nbr, key) {
    const { i18n, credFilters /* , credentials, agenda */ } = this.props;
    const { getLabel } = i18n;

    const label = key + (nbr > 1 ? 's' : '');

    const toggleFilter = e =>
      (credFilters.includes(key) ? this.removeFilter : this.addFilter)(e, key);

    if (!nbr) return null;

    const active = credFilters?.includes(key);

    return (
      <li role="presentation" className={classNames({ active })}>
        {/* eslint-disable-next-line */}
        <a href="#" type="button" className="nav-link" onClick={toggleFilter}>
          <strong>{nbr || 0}</strong> {getLabel(label)}{' '}
          <i
            className={classNames('fa fa-times', {
              invisible: !active,
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
      loadLoading,
      listLoading,
      nextLoading,
      stats,
      search,
      getStats,
      showModal,
      closeModal,
      setModal,
      modals,
      patchSuccessModal,
      patch,
      invite,
      remove,
      sendMessage,
      credFilters,
      showInviteResult,
      cleanInviteResult,
      resendInvitation,
      reactReduxContext,
      inviteError,
      agenda,
      member,
      query,
      i18n,
      user,
      schema,
      intl,
    } = this.props;
    const { getLabel, lang } = i18n;

    const {
      administrator: totalAdministrator,
      moderator: totalModerator,
      contributor: totalContributor,
      reader: totalReader,
    } = stats.totalPerRole || {};

    const {
      store: { dispatch },
    } = reactReduxContext;

    const editModal = modals.editMember || {};
    const removeModal = modals.removeMember || {};
    const inviteMembersModal = modals.inviteMembers || {};
    const memberReinvitedModal = modals.memberReinvited || {};
    const writeToMembersModal = modals.writeToMembers || {};

    const isListFiltered = !!Object.keys(query ?? {}).length;

    if (loadLoading) {
      return <Loading />;
    }

    return (
      <div>
        <div className="text-right">
          <div className="btn-group">
            <Dropdown
              className="dropdown btn-group open"
              Trigger={props => (
                <button type="button" {...props} className="btn btn-default">
                  {getLabel('export')}&nbsp;
                  <span className="caret" />
                </button>
              )}
            >
              <ul className="list-unstyled margin-v-z">
                <li key="download-xlsx">
                  <a
                    className="btn btn-link padding-v-xs btn-block"
                    download={`agenda.${agenda.slug}.members.xlsx`}
                    href={res.exportToXlsx.replace(':slug', agenda.slug)}
                  >
                    XLSX
                  </a>
                </li>
                <li key="download-csv">
                  <a
                    className="btn btn-link padding-v-xs btn-block"
                    download={`agenda.${agenda.slug}.members.csv`}
                    href={res.exportToCsv.replace(':slug', agenda.slug)}
                  >
                    CSV
                  </a>
                </li>
              </ul>
            </Dropdown>

            <button
              type="button"
              className="btn btn-default"
              onClick={() => showModal('inviteMembers')}
            >
              {getLabel('invite')}
            </button>

            {agenda.credentials.invitationMessage ? null : (
              <Dropdown
                className="dropdown btn-group open"
                Trigger={props => (
                  <button className="btn btn-default" type="button" {...props}>
                    <i className="fa fa-ellipsis-v" aria-hidden="true" />
                  </button>
                )}
              >
                <ul className="list-unstyled margin-v-z">
                  <li key="moderators-feature">
                    <a
                      className="btn btn-link padding-v-xs btn-block"
                      href={`/support?origin=${encodeURIComponent(
                        window.location.pathname,
                      )}&subject=moderators`}
                    >
                      <i className="golden-icon" />
                      &nbsp;
                      {getLabel('nameModerators')}
                    </a>
                  </li>
                </ul>
              </Dropdown>
            )}
          </div>
        </div>

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
            sortOrder: 'asc',
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
                loading={listLoading}
              />

              {query.userUid && members?.length ? (
                <div className="pull-left">
                  <div className="badge badge-info">
                    {members[0].custom.contactName
                      || members[0].user?.fullName
                      || (members[0].invited
                        ? members[0].custom.email || getLabel('invited')
                        : getLabel('noName'))}
                    <button
                      type="button"
                      title={getLabel('removeFilter')}
                      className="btn btn-link btn-link-inline margin-left-xs"
                      onClick={this.removeMemberFilter}
                    >
                      <i className="fa fa-times" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="text-right form-group form-inline">
                {getLabel('sortBy')}{' '}
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
          {
            // if there is a search or filter(s)
            (total > 0 && total < (stats.total || 0)) // if total differ of 0 or stats.total
            || (((credFilters && credFilters.length)
              || (!!search && search === query.search))
              && !listLoading) ? (
                <span className="margin-left-sm">
                  {getLabel('result')}: <strong>{total}</strong>{' '}
                  {getLabel(total <= 1 ? 'member' : 'members').toLowerCase()}
                </span>
              ) : null
          }
          {total > 0 && agenda.credentials.invitationMessage ? (
            <>
              <button
                type="button"
                className="btn btn-default btn-medium margin-left-sm"
                onClick={() =>
                  showModal('writeToMembers', {
                    query: {
                      search: query.search || undefined,
                      role: credFilters,
                    },
                  })}
              >
                {getLabel(total > 1 ? 'writeToThem' : 'writeToHim')}
              </button>

              <HistoryModal
                lang={lang}
                trigger={({ openModal }) => (
                  <HistoryModalButton openModal={openModal}>
                    {intl.formatMessage(messages.messageHistory)}
                  </HistoryModalButton>
                )}
                res={`/${agenda.slug}/admin/members/message-history`}
                modalTitle={intl.formatMessage(messages.messageHistory)}
              />
            </>
          ) : null}
          {total > 0 && !agenda.credentials.invitationMessage ? (
            <a
              className="btn btn-default btn-medium margin-left-sm"
              target="_blank"
              rel="noopener noreferrer"
              href={`/support?origin=${encodeURIComponent(
                window.location.pathname,
              )}&subject=writeToAll`}
            >
              <i className="golden-icon" />{' '}
              {getLabel(total > 1 ? 'writeToThem' : 'writeToHim')}
            </a>
          ) : null}
        </div>

        <div>
          {members
            && members.map(m => (
              <MemberItem
                user={user}
                userRole={member.role}
                key={`member-${m.id}`}
                member={m}
                showModal={showModal}
                patchRole={role => patch(agenda, m.id, { role })}
                resendInvitation={resendInvitation}
                agenda={agenda}
                i18n={i18n}
              />
            ))}

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

        {patchSuccessModal && (
          <Modal
            title={getLabel('operationSuccessful')}
            visible
            onClose={() => dispatch(membersActions.patchSuccessConfirm())}
          >
            {getLabel('patchSuccessConfirm')}
          </Modal>
        )}

        {editModal.visible ? (
          <MemberForm
            lang={lang}
            operation="update"
            mode="modal"
            description={null}
            optionalFields
            showSuccessMessage
            getRes={`${res.get
              .replace(':agendaUid', agenda.uid)
              .replace(':userUid', editModal.member.userUid)
              .replace(':memberId', editModal.member.id)}`}
            saveRes={`${res.update
              .replace(':agendaUid', agenda.uid)
              .replace(':memberId', editModal.member.id)}`}
            onSuccess={update => {
              dispatch(membersActions.updateListItem(update));

              getStats(agenda);
            }}
            onCloseModalRequest={() => closeModal('editMember')}
            schema={schema}
            userRole={member.role}
          />
        ) : null}

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
                    onClick={() =>
                      remove(agenda, removeModal.member.id)
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
              overlay: 'popup-overlay big',
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
                agenda={agenda}
                userCredential={member.role}
                onSubmit={data =>
                  invite(agenda, data).then(async result => {
                    await this.search({ search });
                    await getStats(agenda);
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
            title={intl.formatMessage(messages.sendMessageToMembers)}
            visible={writeToMembersModal.visible || false}
            onClose={() => closeModal('writeToMembers')}
            classNames={{
              overlay: 'popup-overlay big',
              title: 'popup-title padding-bottom-z',
            }}
          >
            <p>
              {isListFiltered
                ? intl.formatMessage(messages.sendMessageToFilteredMembers, {
                  count: total,
                  total: stats.total,
                })
                : intl.formatMessage(messages.sendMessageToUnfilteredMembers, {
                  total: stats.total,
                })}
            </p>
            {!writeToMembersModal.confirmation ? (
              <SendMessageForm
                onSubmit={data =>
                  sendMessage(agenda, data, writeToMembersModal.query).then(
                    () => setModal('writeToMembers', { confirmation: true }),
                  )}
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
