import React, { Component, PropTypes } from 'react';
import { asyncConnect } from 'redux-connect';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import monitorBottomHit from 'dom-utils/monitorBottomHit';
import Spinner from 'react-form-components/build/Spinner';
import * as agendasActions from '../../redux/modules/agendas';

const selector = formValueSelector( 'homeDashboard' );

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};


@asyncConnect( [ {
  promise: ( { store: { dispatch, getState } } ) => {
    const state = getState();
    const query = state.routing.locationBeforeTransitions.query;

    if ( !agendasActions.isLoaded( state ) ) {
      return dispatch( agendasActions.load( query ) );
    }
  }
} ] )
@connect(
  ( state, props ) => ({
    initialValues: {
      search: props.location.query.search || ''
    },
    res: state.res,
    agendas: state.agendas.data,
    page: state.agendas.page,
    total: state.agendas.total,
    loading: state.agendas.loading,
    search: selector( state, 'search' ),
    perPageLimit: state.settings.perPageLimit
  }),
  agendasActions
)
@reduxForm( {
  form: 'homeDashboard'
} )
export default class Dashboard extends Component {

  static propTypes = {
    list: PropTypes.func,
    nextPage: PropTypes.func,
    res: PropTypes.object,
    agendas: PropTypes.array,
    page: PropTypes.number,
    total: PropTypes.number,
    loading: PropTypes.bool,
    nextLoading: PropTypes.bool,
    search: PropTypes.string,
    perPageLimit: PropTypes.number
  };

  static contextTypes = {
    router: PropTypes.object,
    getLabel: PropTypes.func
  };

  renderField = ( {
    content, input: { name, value }, label, subLabel, max, classNameGroup, visible,
    errorOnDirty, meta: { touched, error, dirty }
  } ) => {
    const displayError = errorOnDirty ? dirty || touched : touched;

    if ( visible !== true ) return <div></div>;

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

  search = values => this.props.list( values )
    .then( () => {
      this.context.router.push( {
        ...this.props.location,
        query: { ...this.props.location.query, search: values.search || undefined }
      } );
    } );

  debouncedSearch = debounce( this.props.handleSubmit( this.search ), 400 );

  nextPage = () => {
    const { page, total, search, loading, nextLoading, agendas, perPageLimit } = this.props;
    if ( !agendas || !agendas.length || loading || nextLoading || page * perPageLimit >= total ) return;
    this.props.nextPage( { search }, (page || 1) + 1 );
  };

  componentWillMount() {
    if ( typeof document === 'undefined' ) return;
    monitorBottomHit( throttle( this.nextPage, 400 ) );
  }

  render() {
    const {
      res, handleSubmit, agendas, loading, nextLoading,
      search, perPageLimit, total, location: { query }
    } = this.props;
    const { getLabel } = this.context;
    const newUser = !search && !query.search && (!agendas || !agendas.length);

    if ( newUser ) {
      return (
        <div className="row">
          <div className="text-center new-user padding-v-md">
            <h2 className="margin-v-md">{getLabel( 'welcome' )}</h2>
            <a href={res.new} className="btn btn-primary margin-v-sm">{getLabel( 'createAgenda' )}</a>
            <p className="margin-v-sm">{getLabel( 'orContributeToExisting' )}</p>
            <form action={res.search} method="GET">
              <div className="form-group search center-block">
                <input type="text" name="search" className="form-control" />
                <button type="submit" className="btn">
                  <i className="fa fa-search" aria-hidden="true"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="header">
          <h2 className="hidden-xs">{getLabel( 'myAgendas' )}</h2>
          <div className="hidden-xs pull-right">
            <a href={res.new} className="btn btn-primary create-agenda" type="button">
              {getLabel( 'createAgenda' )}
            </a>
          </div>
        </div>
        <form onSubmit={handleSubmit( this.search )}>
          <Field
            component={this.renderSearchInput}
            name="search"
            type="text"
            classNameGroup="search"
            className="form-control"
            placeholder={getLabel( 'searchAgenda' )}
            action={this.debouncedSearch}
            loading={loading}
            visible={total > perPageLimit || query.search || search}
          />
        </form>
        <div className="row">
          {agendas && agendas.map( agenda => (
            <div className="agenda-item media" key={agenda.uid}>

              <div className="media-left">
                <a href={res.show.replace( ':slug', agenda.slug )}>
                  <img className="media-object ill avatar" src={agenda.image} alt={agenda.title} />
                </a>
              </div>
              <div className="media-body">
                <div className="title media-heading">
                  <a href={res.show.replace( ':slug', agenda.slug )}><strong>{agenda.title}</strong></a>
                  {!!agenda.official && <div className="official">
                    <i />
                    <div className="tooltip right" role="tooltip">
                      <div className="tooltip-arrow" />
                      <div className="tooltip-inner">{getLabel( 'officialAgenda' )}</div>
                    </div>
                  </div>}
                </div>
                <div className="actions">
                  {agenda.credential > 1 && <a
                    href={res.moderate.replace( ':slug', agenda.slug )}
                    className="text-muted"
                  >
                    {agenda.credential == 2 ? getLabel( 'manage' ) : getLabel( 'moderate' )}
                  </a>}
                  <a href={res.addEvent.replace( ':slug', agenda.slug )} className="text-muted">
                    {getLabel( 'addAnEvent' )}
                  </a>
                </div>
              </div>
            </div>
          ) )}

          {!agendas || !agendas.length && <div className="text-center text-muted margin-top-md">
            {getLabel( 'noResult' )}
          </div>}

          {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
            <Spinner />
          </div>}
        </div>
      </div>
    );
  }

};
