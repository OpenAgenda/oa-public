import React, { Component, PropTypes } from 'react';
import { asyncConnect } from 'redux-connect';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector, SubmissionError } from 'redux-form';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import monitorBottomHit from 'dom-utils/monitorBottomHit';
import Modal from 'react-components/build/Modal';
import Spinner from 'react-form-components/build/Spinner';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import InviteMembersForm from '../../components/InviteMembersForm/InviteMembersForm';
import EditMemberForm from '../../components/EditMemberForm/EditMemberForm';
import * as membersActions from '../../redux/modules/members';
import * as modalsActions from '../../redux/modules/modals';
import { renderField, renderSearchInput } from '../../utils/form';

const dashboardValuesSelector = formValueSelector( 'membersDashboard' );
// const selector = formValueSelector( 'membersDashboard' );

const base64encode = str => {
  // str = encodeURIComponent( str );
  return typeof window === 'undefined' ? new Buffer( str ).toString( 'base64' ) : btoa( str );
};

@asyncConnect( [ {
  promise: ( { store: { dispatch, getState } } ) => {
    const promises = [];
    const state = getState();
    const query = state.routing.locationBeforeTransitions.query;

    if ( !membersActions.isLoaded( state ) ) {
      promises.push( dispatch( membersActions.getStats() ) );
      promises.push( dispatch( membersActions.load( query ) ) );
    }

    return Promise.all( promises );
  }
} ] )
@connect(
  ( state, props ) => ({
    initialValues: {
      search: props.location.query.search || ''
    },
    res: state.res,
    userCredential: state.stakeholder.credential,
    stakeholders: state.members.data,
    page: state.members.page,
    total: state.members.total,
    loading: state.members.loading,
    nextLoading: state.members.nextLoading,
    credFilters: state.members.credFilters,
    showInviteResult: state.members.showInviteResult,
    inviteError: state.members.inviteError,
    stats: state.members.stats,
    search: dashboardValuesSelector( state, 'search' ),
    agenda: state.agenda,
    perPageLimit: state.settings.perPageLimit,
    modals: state.modals
  }),
  { ...membersActions, ...modalsActions }
)
@reduxForm( {
  form: 'membersDashboard'
} )
export default class Dashboard extends Component {

  static propTypes = {
    list: PropTypes.func,
    remove: PropTypes.func,
    nextPage: PropTypes.func,
    res: PropTypes.object,
    userCredential: PropTypes.number,
    stakeholders: PropTypes.array,
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
    router: PropTypes.object,
    getLabel: PropTypes.func
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
    const { list, location, credFilters } = this.props;

    const query = { search: search || undefined, credentials: credFilters };

    return list( query )
      .then( () => this.context.router.push( { ...location, query } ) );
  }

  debouncedSearch = debounce( this.props.handleSubmit( this.search ), 400 );

  nextPage = () => {
    const { page, total, search, loading, nextLoading, stakeholders, perPageLimit } = this.props;
    if ( !stakeholders || !stakeholders.length || loading || nextLoading || page * perPageLimit >= total ) return;
    this.props.nextPage( { search }, (page || 1) + 1 );
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

  credentialToStr( credential ) {

    const { getLabel } = this.context;

    switch ( credential ) {
      case 1:
        return getLabel( 'contributor' );
      case 2:
        return getLabel( 'administrator' );
      case 3:
        return getLabel( 'moderator' );
      case 4:
        return getLabel( 'reader' );
    }

  }

  componentDidMount() {
    monitorBottomHit( throttle( this.nextPage, 400, { trailing: false } ) );
  }

  renderStakeholder( stakeholder ) {
    const { id, credential, custom, eventCount, user, deletedUser } = stakeholder;
    const { getLabel } = this.context;
    const { res, showModal, userCredential } = this.props;

    return (
      <div key={id} className="bo-list-item media">
        <div className="media-body">
          <div className="title media-heading">
            <strong className={classNames( { 'text-muted': !custom.contactName } )}>
              {custom.contactName || (user && user.full_name) || getLabel( 'noName' )}
            </strong>{' '}
            <span className="text-muted small">{this.credentialToStr( credential )}</span>
          </div>
          <div className="actions">
            {deletedUser && <p className="text-danger">{getLabel( 'deletedUser' )}</p>}
            {(custom.organization || custom.contactPosition) && <p>
              {<span className="text-muted">{custom.organization || null}</span>}
              {custom.organization && custom.contactPosition && ' - '}
              {<span className="text-muted">{custom.contactPosition || null}</span>}
            </p>}
            {(custom.email || custom.contactNumber) && <p>
              {<span className="text-muted">{custom.email || null}</span>}
              {custom.email && custom.contactNumber && ' - '}
              {<span className="text-muted">{custom.contactNumber || null}</span>}
            </p>}

            <a
              href={res.showContributor.replace( ':contributorId', id )}
              className="text-muted">{eventCount} {getLabel( 'events' )}
            </a>
            {(userCredential !== 3 || ![ 2, 3 ].includes( credential ) ) && <a
              role="button"
              className="text-muted"
              onClick={() => showModal( 'editMember', { stakeholder } )}
            >
              {getLabel( 'editProfile' )}
            </a>}
            {(userCredential !== 3 || ![ 2, 3 ].includes( credential ) ) && <a
              role="button"
              className="text-muted"
              onClick={() => showModal( 'removeMember', { stakeholder } )}
            >
              {getLabel( 'removeMember' )}
            </a>}
            {user && <a
              href={res.writeToMember.replace( ':uid', user.uid ).replace( ':redirect', base64encode( res.app ) )}
              className="text-muted"
            >
              {getLabel( 'writeToHim' )}
            </a>}
          </div>
        </div>
      </div>
    );
  }

  renderFilter( nbr, key ) {
    const { credFilters } = this.props;
    const { getLabel } = this.context;

    const toggleFilter = credFilters.includes( key ) ? this.removeFilter : this.addFilter;
    const label = key + (nbr > 1 ? 's' : '');

    return (
      <li role="presentation" className={classNames( { active: credFilters.includes( key ) } )}>
        <a href="#" onClick={e => toggleFilter( e, key )}>
          <strong>{nbr}</strong> {getLabel( label )}{' '}
          <i
            className={classNames( 'fa fa-times', { invisible: !credFilters.includes( key ) } )}
            aria-hidden="true"
          ></i>
        </a>
      </li>
    );
  }

  render() {
    const {
      res, handleSubmit, stakeholders, total, loading, nextLoading, stats,
      showModal, closeModal, modals, update, invite, remove,
      showInviteResult, cleanInviteResult, inviteError
    } = this.props;
    const { getLabel } = this.context;

    const {
      administrator: totalAdministrator,
      moderator: totalModerator,
      contributor: totalContributor,
      reader: totalReader
    } = stats.credentialTotals;

    const editModal = modals.editMember || {};
    const removeModal = modals.removeMember || {};
    const inviteMembersModal = modals.inviteMembers || {};

    return (
      <div>
        <h2>
          {getLabel( 'members' )}

          <div className="pull-right">
            <DropdownButton bsStyle='default' title={getLabel( 'actions' )} id='dropdown-actions' pullRight>
              <MenuItem onClick={() => showModal( 'inviteMembers' )}>{getLabel( 'inviteMembers' )}</MenuItem>
              {/* <MenuItem>Importer des contributeurs</MenuItem> */}
              <MenuItem divider />
              <MenuItem href={res.exportToXlsx}>{getLabel( 'exportToXlsx' )}</MenuItem>
              <MenuItem href={res.exportToCsv}>{getLabel( 'exportToCsv' )}</MenuItem>
            </DropdownButton>
          </div>
        </h2>

        <p>
          {getLabel( 'total' )}: <strong>{stats.total || 0}</strong>
        </p>

        <ul className="nav nav-pills" role="tablist">
          {/* <li role="presentation" className={classNames( { active: !credFilters.length } )}>
            <a href="#" onClick={e => this.cleanFilters( e )}>
              <strong>{stats.total || 0}</strong> Total{' '}
              <i className={classNames( 'fa fa-times', { invisible: credFilters.length } )} aria-hidden="true"></i>
            </a>
          </li> */}
          {totalAdministrator > 0 && this.renderFilter( totalAdministrator || 0, 'administrator' )}
          {totalModerator > 0 && this.renderFilter( totalModerator || 0, 'moderator' )}
          {totalContributor > 0 && this.renderFilter( totalContributor || 0, 'contributor' )}
          {totalReader > 0 && this.renderFilter( totalReader || 0, 'reader' )}
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

        {total > 0 && <div className="margin-v-md">
          {getLabel( 'result' )}: {total} {getLabel( 'members' ).toLowerCase()}
        </div>}

        <div>
          {stakeholders && stakeholders.map( s => this.renderStakeholder( s ) )}

          {!stakeholders || !stakeholders.length ? <div className="text-center text-muted margin-v-md">
            {getLabel( 'noResult' )}
          </div> : null}

          {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
            <Spinner />
          </div>}
        </div>

        {editModal.visible && <Modal
          title={getLabel( 'editProfile' )}
          onClose={() => closeModal( 'editMember' )}
        >
          <EditMemberForm
            stakeholder={editModal.stakeholder}
            onSubmit={( ...params ) => update( editModal.stakeholder.id, ...params )
              .then( result => {
                if ( result.error && result.error instanceof SubmissionError ) {
                  throw new SubmissionError( result.error.errors );
                } else {
                  closeModal( 'editMember' );
                }
                return result;
              } )
            }
          />
        </Modal>}

        {removeModal.visible && <Modal
          title={getLabel( 'removeMember' )}
          visible={removeModal.visible || false}
          onClose={() => closeModal( 'removeMember' )}
        >
          <p className="margin-top-sm">{getLabel( 'removeConfirmMessage' )}</p>
          <div className="text-center">
            <button
              className="btn btn-danger"
              onClick={() => remove( removeModal.stakeholder.id )
                .then( () => closeModal( 'removeMember' ) )}
            >
              {getLabel( 'removeMember' )}
            </button>
          </div>
        </Modal>}

        {inviteMembersModal.visible && <Modal
          title={getLabel( 'inviteMembers' )}
          onClose={() => {
            closeModal( 'inviteMembers' );
            cleanInviteResult();
          }}
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
            .then( result => {
              if ( result.error && result.error instanceof SubmissionError ) {
                throw new SubmissionError( result.error.errors );
              }
              return result;
            } )
          } />}
        </Modal>}
      </div>
    );

  }

};
