import React, { Component, PropTypes } from 'react';
import { asyncConnect } from 'redux-connect';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import deepExtend from 'deep-extend';
import monitorBottomHit from 'dom-utils/monitorBottomHit';
import Modal from 'react-components/build/Modal';
import Spinner from 'react-form-components/build/Spinner';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import InviteMembersForm from '../../components/InviteMembersForm/InviteMembersForm';
import * as membersActions from '../../redux/modules/members';
import * as modalsActions from '../../redux/modules/modals';

const selector = formValueSelector( 'membersDashboard' );

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
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
    stakeholders: state.members.data,
    page: state.members.page,
    total: state.members.total,
    loading: state.members.loading,
    nextLoading: state.members.nextLoading,
    credFilters: state.members.credFilters,
    stats: state.members.stats,
    search: selector( state, 'search' ),
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
    modals: PropTypes.object
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
  }

  renderField = ( {
    content, input: { name, value }, label, subLabel, max, classNameGroup, visible,
    errorOnDirty, meta: { touched, error, dirty }
  } ) => {
    const displayError = errorOnDirty ? dirty || touched : touched;

    if ( visible === false ) return <div></div>;

    return (
      <div className={`form-group ${classNameGroup} ${displayError && error ? 'has-error has-feedback' : ''}`}>
        {label && <label htmlFor={name}>{label}</label>}
        {subLabel}
        {content}
        {displayError && error && <span className="form-control-feedback">
          <i className="fa fa-times" aria-hidden="true"></i>
        </span>}
        {displayError && error && <div className={`text-danger ${max && 'pull-left' || ''}`}>
          {this.context.getLabel( error )}
        </div>}
        {max && <div className={`text-right ${max - value.length < 0 && 'text-danger' || ''}`}>
          {max - value.length}
        </div>}
      </div>
    );
  };

  renderSearchInput = ( { type, placeholder, className, spellCheck, action, loading, ...props } ) => {
    const inputAttrs = { type, placeholder, className, spellCheck };
    const onChange = e => {
      props.input.onChange( e.target.value );
      action();
    };
    const content = <div className="input-icon-right">
      <input {...props.input} {...inputAttrs} onChange={onChange} />
      <button type="submit" className="btn">
        {loading ? <Spinner spinner={searchSpinner} /> : <i className="fa fa-search" aria-hidden="true"></i>}
      </button>
    </div>;
    return this.renderField( { content, ...props } );
  };

  search = ( { search } ) => {
    const { list, location, credFilters } = this.props;

    const query = { search: search || undefined, credentials: credFilters };

    return list( query )
      .then( () => this.context.router.push( deepExtend( location, { query } ) ) );
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
    const { id, credential, custom, eventCount, user } = stakeholder;
    const { getLabel } = this.context;
    const { res, showModal } = this.props;

    if ( !stakeholder.user ) return <div key={id}></div>;

    return (
      <div key={id} className="bo-list-item media">
        <div className="media-body">
          <div className="title media-heading">
            {/*<a href="#">*/}
              <strong>{user.full_name}</strong>{' '}
              <span className="text-muted small">{this.credentialToStr( credential )}</span>
            {/*</a>*/}
          </div>
          <div className="actions">
            {custom.organization && custom.organization.label &&
            <p className="text-muted">{custom.organization.label}</p>}

            {custom.contactNumber && <p className="text-muted">{custom.contactNumber}</p>}

            <p className="text-muted">{user.email}</p>

            <a
              href={res.showContributor.replace( ':contributorUid', user.uid )}
              className="text-muted">{eventCount} {getLabel( 'events' )}
            </a>
            {/*<button type="button" className="btn btn-link text-muted">{eventCount} {getLabel( 'events' )}</button>*/}
            {/*<a href="#" className="text-muted">Modifier son profil</a>*/}
            {/*<a
              role="button"
              className="text-muted"
              onClick={() => showModal( 'removeMember', { id } )}
            >
              Retirer des membres
            </a>*/}
            {/*<a href="#" className="text-muted">Lui écrire</a>*/}
          </div>
        </div>
      </div>
    );
  }

  renderFilter( nbr, key, label ) {
    const { credFilters } = this.props;
    const toggleFilter = credFilters.includes( key ) ? this.removeFilter : this.addFilter;

    return (
      <li role="presentation" className={classNames( { active: credFilters.includes( key ) } )}>
        <a href="#" onClick={e => toggleFilter( e, key )}>
          <strong>{nbr}</strong> {label}{' '}
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
      res, handleSubmit, stakeholders, total, loading, nextLoading, credFilters, stats,
      showModal, closeModal, modals, remove, perPageLimit
    } = this.props;
    const { getLabel } = this.context;

    const {
      administrator: totalAdministrator,
      moderator: totalModerator,
      contributor: totalContributor,
      reader: totalReader
    } = stats.credentialTotals;

    const removeModal = modals.removeMember || {};
    const inviteMembersModal = modals.inviteMembers || {};

    return (
      <div>
        <h2>
          {getLabel( 'members' )}

          {/*<div className="pull-right">
            <DropdownButton bsStyle='default' title='Actions' id='dropdown-actions' pullRight>
              <MenuItem onClick={() => showModal( 'inviteMembers' )}>Inviter des contributeurs</MenuItem>
              /!*<MenuItem>Importer des contributeurs</MenuItem>*!/
              <MenuItem divider />
              <MenuItem>Exporter en xls</MenuItem>
              <MenuItem>Exporter en csv</MenuItem>
              <MenuItem divider />
              <MenuItem>Ecrire aux utilisateurs</MenuItem>
            </DropdownButton>
          </div>*/}
        </h2>

        <p>
          {getLabel( 'total' )}: <strong>{stats.total || 0}</strong>
        </p>

        <ul className="nav nav-pills" role="tablist">
          {/*<li role="presentation" className={classNames( { active: !credFilters.length } )}>
            <a href="#" onClick={e => this.cleanFilters( e )}>
              <strong>{stats.total || 0}</strong> Total{' '}
              <i className={classNames( 'fa fa-times', { invisible: credFilters.length } )} aria-hidden="true"></i>
            </a>
          </li>*/}
          {totalAdministrator > 0 && this.renderFilter( totalAdministrator || 0, 'administrator', 'Administrateurs' )}
          {totalModerator > 0 && this.renderFilter( totalModerator || 0, 'moderator', 'Modérateurs' )}
          {totalContributor > 0 && this.renderFilter( totalContributor || 0, 'contributor', 'Contributeurs' )}
          {totalReader > 0 && this.renderFilter( totalReader || 0, 'reader', 'Lecteurs' )}
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

        <Modal
          title={getLabel( 'removeMember' )}
          visible={removeModal.visible || false}
          onClose={() => closeModal( 'removeMember' )}
        >
          <p className="margin-top-sm">{getLabel( 'removeConfirmMessage' )}</p>
          <div className="text-center">
            <button
              className="btn btn-danger"
              onClick={() => remove( removeModal.id )
                .then( () => closeModal( 'removeMember' ) )}
            >
              {getLabel( 'removeMember' )}
            </button>
          </div>
        </Modal>

        <Modal
          title={getLabel( 'inviteMembers' )}
          visible={inviteMembersModal.visible || false}
          onClose={() => closeModal( 'inviteMembers' )}
        >
          <InviteMembersForm onSubmit={() => {
          }} />

          <div className="text-center">
            <button
              className="btn btn-primary"
              onClick={() => remove( inviteMembersModal.id )
                .then( () => closeModal( 'inviteMembers' ) )}
            >
              {getLabel( 'inviteMembers' )}
            </button>
          </div>
        </Modal>
      </div>
    );

  }

};
