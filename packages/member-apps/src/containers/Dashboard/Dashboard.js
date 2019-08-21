import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { provideHooks } from 'redial';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector, SubmissionError } from 'redux-form';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import upperFirst from 'lodash/upperFirst';
import { Button, DropdownButton, MenuItem } from 'react-bootstrap';
import { Base64 } from 'js-base64';
import qs from 'qs';

import getRoleSlug from '@openagenda/members/lib/getRoleSlug';
import monitorBottomHit from '@openagenda/dom-utils/monitorBottomHit';
import Modal from '@openagenda/react-components/build/Modal';
import MoreInfo from '@openagenda/react-components/build/MoreInfo';
import Spinner from '@openagenda/react-form-components/build/Spinner';
import openRequestForm from '@openagenda/call-to-action/dist/client/openRequestForm';

import InviteMembersForm from '../../components/InviteMembersForm/InviteMembersForm';
import EditMemberForm from '../../components/EditMemberForm/EditMemberForm';
import SendMessageForm from '../../components/SendMessageForm/SendMessageForm';
import * as membersActions from '../../redux/modules/members';
import * as modalsActions from '../../redux/modules/modals';
import { renderField, renderSearchInput } from '../../utils/form';

const dashboardValuesSelector = formValueSelector( 'membersDashboard' );

@provideHooks( {
  fetch: async ( { store: { dispatch, getState }, location } ) => {
    const state = getState();
    const query = qs.parse( location.search, { ignoreQueryPrefix: true } );
    const promises = [];

    if ( !membersActions.isLoaded( state ) ) {
      promises.push( dispatch( membersActions.getStats() ) );
      promises.push( dispatch( membersActions.load( query ) ) );
    }

    return Promise.all( __CLIENT__ ? [] : promises );
  }
} )
@connect(
  ( state, props ) => {
    const query = qs.parse( props.location.search, { ignoreQueryPrefix: true } );

    return {
      initialValues: {
        search: query.search || ''
      },
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
      search: dashboardValuesSelector( state, 'search' ),
      agenda: state.agenda,
      perPageLimit: state.settings.perPageLimit,
      modals: state.modals,
      roles: state.agenda.roles
    }
  },
  { ...membersActions, ...modalsActions }
)
@reduxForm( {
  form: 'membersDashboard'
} )
@withRouter
export default class Dashboard extends Component {
  static propTypes = {
    list: PropTypes.func,
    remove: PropTypes.func,
    nextPage: PropTypes.func,
    res: PropTypes.object,
    userCredential: PropTypes.number,
    members: PropTypes.array,
    addCredFilter: PropTypes.func,
    removeCredFilter: PropTypes.func,
    cleanCredFilters: PropTypes.func,
    credFilters: PropTypes.array,
    page: PropTypes.number,
    total: PropTypes.number,
    stats: PropTypes.object,
    loading: PropTypes.bool,
    nextLoading: PropTypes.bool,
    search: PropTypes.string,
    slug: PropTypes.string,
    perPageLimit: PropTypes.number,
    showModal: PropTypes.func,
    closeModal: PropTypes.func,
    modals: PropTypes.object,
    stopSubmit: PropTypes.func
  };

  static contextTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string
  };

  constructor( props ) {
    super( props );
    this.addFilter = ::this.addFilter;
    this.removeFilter = ::this.removeFilter;
    this.cleanFilters = ::this.cleanFilters;
    this.renderField = this::renderField;
    this.renderSearchInput = this::renderSearchInput;
  }

  search = ( { search } ) => {
    const { list, location, credFilters, history } = this.props;

    const query = { search: search || undefined, role: credFilters };

    return list( query )
      .then( () => history.push( { ...location, search: qs.stringify( query, { arrayFormat: 'brackets' } ) } ) );
  }

  debouncedSearch = debounce( this.props.handleSubmit( this.search ), 400 );

  nextPage = () => {
    const { page, total, search, credFilters, loading, nextLoading, members, perPageLimit } = this.props;
    if ( !members || !members.length || loading || nextLoading || page * perPageLimit >= total ) return;
    this.props.nextPage( { search: search || undefined, role: credFilters }, (page || 1) + 1 );
  };

  addFilter( e, key ) {
    e.preventDefault();

    const { addCredFilter, search } = this.props;
    addCredFilter( key );
    this.forceUpdate( () => this.search( { search } ) );
  }

  removeFilter( e, key ) {
    e.preventDefault();

    const { removeCredFilter, search } = this.props;
    removeCredFilter( key );
    this.forceUpdate( () => this.search( { search } ) );
  };

  cleanFilters( e ) {
    e.preventDefault();

    const { cleanCredFilters, search } = this.props;
    cleanCredFilters();
    this.forceUpdate( () => this.search( { search } ) );
  };

  roleLabel( role ) {
    const { getLabel } = this.context;

    return getLabel( getRoleSlug( role ) );
  }

  componentDidMount() {
    monitorBottomHit( throttle( this.nextPage, 400, { trailing: false } ) );
  }

  componentWillUnmount() {
    monitorBottomHit.stop();
  }

  renderMember( member ) {
    const { id, role, invited, custom, eventCount, user, deletedUser, owner } = member;
    const { res, showModal, userShId, userRole, resendInvitation, location, agenda } = this.props;
    const { getLabel } = this.context;

    const memberType = (() => {
      if ( invited && !deletedUser ) return 'invited';
      if ( role === 1 && eventCount === 0 ) return 'noContrib';
      if ( deletedUser && !invited ) return 'deleted';
    })();

    const base64url = Base64.encode( location.pathname + location.search );

    return (
      <div key={id} className="bo-list-item media">
        <div className="media-body">
          <div className="title media-heading">
            <strong>
              {custom.contactName || (user && user.fullName) ||
              (invited ? custom.email || getLabel( 'invited' ) : getLabel( 'noName' ))}
            </strong>
            {' '}
            <span className="text-muted small">{this.roleLabel( role )}</span>
            {' '}
            <MoreInfo
              id={`moreinfo-${id}`}
              content={getLabel( 'moreinfo' + upperFirst( memberType ) )}
            >
              <span
                className={classNames( 'badge', 'badge-sm', {
                  'badge-info': memberType === 'invited',
                  'badge-default': memberType === 'inactive',
                  'badge-success': memberType === 'active',
                  'badge-warning': [ 'deleted', 'noContrib' ].includes( memberType )
                } )}
              >
                {/*{stakeholderType === 'active' && getLabel( 'active' )}*/}
                {memberType === 'noContrib' && getLabel( 'noContrib' )}
                {memberType === 'invited' && getLabel( 'invited' )}
                {memberType === 'deleted' && getLabel( 'deleted' )}
              </span>
            </MoreInfo>
          </div>
          <div className="actions">
            {(custom.organization || custom.contactPosition) && <p>
              {<span className="text-muted">{custom.organization || null}</span>}
              {custom.organization && custom.contactPosition && ' - '}
              {<span className="text-muted">{custom.contactPosition || null}</span>}
            </p>}
            {!invited && (custom.email || custom.contactNumber) && <p>
              {<span className="text-muted">{custom.email || null}</span>}
              {custom.email && custom.contactNumber && ' - '}
              {<span className="text-muted">{custom.contactNumber || null}</span>}
            </p>}

            <a
              href={res.showContributor.replace( ':contributorId', id )}
              className="text-muted"
            >
              {/*<span className="badge badge-info">*/}
              {eventCount} {getLabel( eventCount && eventCount > 1 ? 'events' : 'event' )}
              {/*</span>*/}
            </a>
            {(userRole !== 3 || ![ 2, 3 ].includes( role )) && <a
              role="button"
              className="text-muted"
              onClick={() => showModal( 'editMember', { member } )}
            >
              {getLabel( 'editProfile' )}
            </a>}
            {!owner && (userRole !== 3 || ![ 2, 3 ].includes( role )) && <a
              role="button"
              className="text-muted"
              onClick={() => showModal( 'removeMember', { member } )}
            >
              {getLabel( 'removeMember' )}
            </a>}
            {user && id !== userShId ? <a
              className="text-muted"
              href={`/${agenda.slug}/admin/members/${id}/contact?creationRedirect=${base64url}`}
            >
              {getLabel( 'sendAMessage' )}
            </a> : null}
            {invited && <a
              role="button"
              onClick={() => resendInvitation( id )
                .then( () => showModal( 'memberReinvited', { member, success: true } ) )
                .catch( () => showModal( 'memberReinvited', { member, success: false } ) )}
              className="text-muted"
            >
              {getLabel( 'resendInvitation' )}
            </a>}
          </div>
        </div>
      </div>
    );
  }

  renderFilter( nbr, key ) {
    const { credFilters, credentials, agenda } = this.props;
    const { getLabel } = this.context;

    const label = key + (nbr > 1 ? 's' : '');
    const toggleFilter = credFilters.includes( key ) ? this.removeFilter : this.addFilter;

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

    if ( !nbr ) return null;

    return (
      <li role="presentation" className={classNames( { active: credFilters.includes( key ) } )}>
        <a href="#" onClick={e => toggleFilter( e, key )}>
          <strong>{nbr || 0}</strong> {getLabel( label )}{' '}
          <i className={classNames( 'fa fa-times', { invisible: !credFilters.includes( key ) } )}/>
        </a>
      </li>
    );
  }

  render() {
    const {
      res, handleSubmit, members, total, loading, nextLoading, stats, search, getStats,
      showModal, closeModal, setModal, modals, update, invite, remove, sendMessage, credFilters,
      showInviteResult, cleanInviteResult, inviteError, credentials, agenda,
      query
    } = this.props;
    const { getLabel, lang } = this.context;

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
          {getLabel( 'members' )}

          <div className="pull-right">
            <div className="btn-group">
              <DropdownButton title={getLabel( 'export' )} id="nested-export-dropdown">
                <MenuItem href={res.exportToXlsx}>XLSX</MenuItem>
                <MenuItem href={res.exportToCsv}>CSV</MenuItem>
              </DropdownButton>

              <Button onClick={() => showModal( 'inviteMembers' )}>
                {getLabel( 'invite' )}
              </Button>

              {!credentials.invitationMessage && (
                <DropdownButton
                  id="nested-more-dropdown"
                  title={<i className="fa fa-ellipsis-v" aria-hidden="true"></i>}
                  pullRight
                  noCaret
                >
                  <MenuItem
                    onClick={() => openRequestForm( { lang, subject: 'moderators', agenda: agenda.slug } )}
                  >
                    <i className="golden-icon"></i>{' '}{getLabel( 'nameModerators' )}
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
          {this.renderFilter( totalAdministrator, 'administrator' )}
          {this.renderFilter( totalModerator, 'moderator' )}
          {this.renderFilter( totalContributor, 'contributor' )}
          {this.renderFilter( totalReader, 'reader' )}
        </ul>

        <form onSubmit={handleSubmit( this.search )}>
          <Field
            component={this.renderSearchInput}
            name="search"
            type="text"
            classNameGroup="search margin-v-md"
            className="form-control"
            placeholder={getLabel( 'searchMember' )}
            action={this.debouncedSearch}
            loading={loading}
          />
        </form>

        {/* total > 0 && <div className="margin-v-md">
          {getLabel( 'result' )}: {total} {getLabel( 'members' ).toLowerCase()}
        </div> */}

        <div className="margin-v-md">
          {getLabel( 'total' )}: <strong>{stats.total || 0}</strong>

          {( // if there is a search or filter(s)
            (total > 0 && total < (stats.total || 0)) // if total differ of 0 or stats.total
            || (((credFilters && credFilters.length) || (!!search && search === query.search)) && !loading)
          ) ? (
            <span className="margin-left-sm">
              {getLabel( 'result' )}: <strong>{total}</strong> {getLabel( total <= 1 ? 'member' : 'members' ).toLowerCase()}
            </span>
          ) : null}

          {total > 0 ? <button
            className="btn btn-default btn-medium margin-left-sm"
            onClick={() => {
              if ( credentials.invitationMessage ) {
                return showModal( 'writeToMembers', {
                  query: { search: search || undefined, role: credFilters }
                } );
              }
              return openRequestForm( { lang, subject: 'writeToAll', agenda: agenda.slug } );
            }}
          >
              {credentials.invitationMessage ? null : <Fragment><i className="golden-icon"></i>{' '}</Fragment>}
              {getLabel( total > 1 ? 'writeToThem' : 'writeToHim' )}
          </button> : null}
        </div>

        <div>
          {members && members.map( s => this.renderMember( s ) )}

          {!members || !members.length ? <div className="text-center text-muted margin-v-md">
            {getLabel( 'noResult' )}
          </div> : null}

          {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
            <Spinner/>
          </div>}
        </div>

        {editModal.visible && <Modal
          title={getLabel( 'editProfile' )}
          onClose={() => closeModal( 'editMember' )}
        >
          <EditMemberForm
            member={editModal.member}
            onSubmit={( ...params ) => update( editModal.member.id, ...params )
              .then( async result => {
                closeModal( 'editMember' );

                await getStats();

                return result;
              } )
              .catch( error => {
                if ( error && error instanceof SubmissionError ) {
                  throw new SubmissionError( error.errors );
                }

                throw error;
              } )
            }
          />
        </Modal>}

        {removeModal.visible && <Modal
          title={getLabel( 'removeMember' )}
          visible={removeModal.visible || false}
          onClose={() => closeModal( 'removeMember' )}
        >
          {removeModal.error ? <div className="text-center">
            <div className="margin-v-sm">
              {getLabel( 'removeModalError' )}
            </div>

            <button
              onClick={() => closeModal( 'removeMember' )}
              className="btn btn-danger"
            >
              {getLabel( 'close' )}
            </button>
          </div> : <div>
            <p className="margin-top-sm">{getLabel( 'removeConfirmMessage' )}</p>
            <div className="text-center">
              <button
                className="btn btn-danger"
                onClick={() => remove( removeModal.member.id )
                  .then( () => closeModal( 'removeMember' ) )
                  .catch( () => setModal( 'removeMember', { error: true } ) )}
              >
                {getLabel( 'removeMember' )}
              </button>
            </div>
          </div>}
        </Modal>}

        {inviteMembersModal.visible && <Modal
          title={getLabel( 'inviteMembers' )}
          onClose={() => {
            closeModal( 'inviteMembers' );
            cleanInviteResult();
          }}
          classNames={{
            overlay: 'popup-overlay big'
          }}
          disableBodyScroll
        >
          {showInviteResult ? <div>
            {inviteError ? <div>
              {inviteError.emailsRejected && inviteError.emailsRejected.length ? <div>
                {getLabel( 'emailsCouldNotBeInvited' )} <b>{inviteError.emailsRejected.join( ', ' )}</b>
              </div> : <div>
                {getLabel( 'invitationProblem' )}
              </div>}
            </div> : <div>
              {getLabel( 'membersInvited' )}
            </div>}
          </div> : <InviteMembersForm onSubmit={data => invite( data )
            .then( async result => {
              await this.search( { search } );
              await getStats();
              return result;
            } )
            .catch( error => {
              if ( error && error instanceof SubmissionError ) {
                throw new SubmissionError( error.errors );
              }
              throw error;
            } )
          }/>}
        </Modal>}

        {memberReinvitedModal.visible && <Modal
          title={getLabel( 'inviteMembers' )}
          onClose={() => {
            closeModal( 'memberReinvited' );
          }}
        >
          {memberReinvitedModal.success ?
            <div>{getLabel( 'invitationResended' )}</div> :
            <div>{getLabel( 'invitationNotResended' )}</div>}
        </Modal>}

        {writeToMembersModal.visible && <Modal
          title={getLabel( 'sendMessageToMembers' )}
          visible={writeToMembersModal.visible || false}
          onClose={() => closeModal( 'writeToMembers' )}
          classNames={{
            overlay: 'popup-overlay big'
          }}
        >
          {!writeToMembersModal.confirmation
            ? <SendMessageForm onSubmit={data => sendMessage( data, writeToMembersModal.query )
              .catch( error => {
                if ( error && error instanceof SubmissionError ) {
                  throw new SubmissionError( error.errors );
                }
                throw error;
              } )
              .then( () => setModal( 'writeToMembers', { confirmation: true } ) )
            }/>
            : <div className="text-center">
              <div className="margin-v-sm">
                {getLabel( 'messageSent' )}
              </div>

              <button
                onClick={() => closeModal( 'writeToMembers' )}
                className="btn btn-danger"
              >
                {getLabel( 'close' )}
              </button>
            </div>}
        </Modal>}
      </div>
    );

  }
};
