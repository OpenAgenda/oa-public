import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import pick from 'lodash/pick';
import Select from 'react-select';
import Spinner from 'react-form-components/build/Spinner';
import moment from 'moment';
import monitorBottomHit from 'dom-utils/monitorBottomHit';
import activityLabels from 'labels/activities/admin';
import activityFormatMaker from 'activities/format';
import * as activitiesActions from '../../redux/modules/activities';
import { renderField, renderSelect, renderInput } from '../../utils/form';
import { DateTimePicker } from '../../components';

import 'moment/locale/fr';
moment.locale( 'fr' );

const formatActivity = activityFormatMaker( {}, activityLabels );

const dashboardValuesSelector = formValueSelector( 'activityAppsAdminDashboard' );

@asyncConnect( [ {
    promise: ( { store: { dispatch, getState } } ) => {
      const state = getState();
      const query = state.routing.locationBeforeTransitions.query;

      if ( !activitiesActions.isLoaded( state ) ) {
        return dispatch( activitiesActions.load( query ) );
      }
    }
  } ],
  ( state, props ) => ({
    initialValues: {
      actor: props.location.query.actor || undefined,
      verb: props.location.query.verb || undefined,
      object: props.location.query.object || undefined,
      target: props.location.query.target || undefined,
      datetimeRange: props.location.query.datetimeRange || undefined
    },
    res: state.res,
    activities: state.activities.data,
    fromId: state.activities.fromId,
    loading: state.activities.loading,
    nextLoading: state.activities.nextLoading,
    lastPage: state.activities.lastPage,
    query: dashboardValuesSelector( state, 'actor', 'verb', 'object', 'target', 'datetimeRange' )
  }),
  { ...activitiesActions }
)
@reduxForm( {
  form: 'activityAppsAdminDashboard'
} )
export default class AdminDashboard extends Component {

  static propTypes = {
    list: PropTypes.func,
    nextPage: PropTypes.func,
    res: PropTypes.object,
    activities: PropTypes.array,
    fromId: PropTypes.number,
    loading: PropTypes.bool,
    nextLoading: PropTypes.bool,
    lastPage: PropTypes.bool
  };

  static contextTypes = {
    router: PropTypes.object,
    getLabel: PropTypes.func
  };

  constructor( props ) {
    super( props );
    this.renderField = this::renderField;
    this.renderSelect = this::renderSelect;
    this.renderInput = this::renderInput;
    this.renderReactSelect = ::this.renderReactSelect;
    this.renderDateTimeRangePicker = ::this.renderDateTimeRangePicker;
  }

  search = values => this.props.list( values )
    .then( () => {
      const newQuery = pick( values, [ 'actor', 'verb', 'object', 'target', 'datetimeRange' ] );
      this.context.router.push( {
        ...this.props.location,
        query: {
          ...this.props.location.query,
          actor: undefined,
          verb: undefined,
          object: undefined,
          target: undefined,
          datetimeRange: undefined,
          ...newQuery
        }
      } );
    } );

  debouncedSearch = debounce( this.props.handleSubmit( this.search ), 400 );

  nextPage = () => {
    const { loading, nextLoading, activities, query, nextPage, lastPage } = this.props;
    if ( !activities || !activities.length || loading || nextLoading || lastPage ) return;
    nextPage( query, activities[ activities.length - 1 ].id );
  };

  renderReactSelect( { className, placeholder, options, instanceId, ...props } ) {

    const inputAttrs = { className, options, placeholder, instanceId };

    const content = <Select {...props.input} {...inputAttrs} />;

    return this.renderField( { content, ...props } );

  }

  renderDateTimeRangePicker( field ) {

    const handleEvent = ( event, picker ) => {

      const range = picker.startDate.format() + '|' + picker.endDate.format();
      this.props.dispatch( this.props.change( field.input.name, range ) );

    };

    const [ startValue = '', endValue = '' ] = (field.input.value || '').split( '|' );

    return (
      <DateTimePicker
        handleEvent={handleEvent}
        startValue={startValue && moment( startValue )}
        endValue={endValue && moment( endValue )}
      />
    );

  }

  componentDidMount() {
    if ( typeof document === 'undefined' ) return;
    monitorBottomHit( throttle( this.nextPage, 400, { trailing: false } ) );
  }

  componentWillUnmount() {
    monitorBottomHit.stop();
  }

  render() {
    const { handleSubmit, reset, activities, nextLoading } = this.props;
    const { getLabel } = this.context;

    return (
      <div className="container-fluid">
        <h2>Activités</h2>
        <form onSubmit={handleSubmit( this.search )}>
          <div className="row">
            <div className="col-md-3">
              <Field
                label="Actor"
                component={this.renderInput}
                name="actor"
                type="text"
                className="form-control"
                classNameGroup="margin-top-md margin-bottom-lg"
              />
            </div>

            <div className="col-md-3">
              <Field
                label="Verb"
                component={this.renderSelect}
                name="verb"
                type="select"
                classNameGroup="margin-top-md margin-bottom-lg"
                className="form-control"
                placeholder="Séléctionner"
              >
                <option value="">Séléctionner</option>
                <option value="agenda.sendInvitation">agenda.sendInvitation</option>
                <option value="agenda.acceptInvitation">agenda.acceptInvitation</option>
                <option value="agenda.addMember">agenda.addMember</option>
                <option value="agenda.setMemberRole">agenda.setMemberRole</option>
                <option value="agenda.create">agenda.create</option>
                <option value="agenda.updateContribution">agenda.updateContribution</option>
                <option value="agenda.updateProfile">agenda.updateProfile</option>
                <option value="agenda.rename">agenda.rename</option>
                <option value="agenda.changeEventState">agenda.changeEventState</option>
                <option value="agenda.publishEvent">agenda.publishEvent</option>
                <option value="agenda.unpublishEvent">agenda.unpublishEvent</option>
                <option value="agenda.removeEvent">agenda.removeEvent</option>
                <option value="agenda.setOfficial">agenda.setOfficial</option>
                <option value="event.create">event.create</option>
                <option value="event.update">event.update</option>
              </Field>
            </div>

            <div className="col-md-3">
              <Field
                label="Object"
                component={this.renderInput}
                name="object"
                type="text"
                className="form-control"
                classNameGroup="margin-top-md margin-bottom-lg"
              />
            </div>

            <div className="col-md-3">
              <Field
                label="Target"
                component={this.renderInput}
                name="target"
                type="text"
                className="form-control"
                classNameGroup="margin-top-md margin-bottom-lg"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-3">
              <Field
                name="datetimeRange"
                component={this.renderDateTimeRangePicker}
              />
            </div>

            <div className="col-md-3">
              <button className="btn btn-primary margin-right-sm" type="submit">Rechercher</button>
              <button className="btn btn-default" type="button" onClick={reset}>Reset</button>
            </div>
          </div>
        </form>

        <div className="row padding-top-md">
          <div className="col-md-offset-3 col-md-6">
            {(activities && activities.length > 0) && <ul className="list-unstyled">
              {activities.map( activity => (
                <li key={activity.id} className="padding-bottom-xs">
                  <label className="pull-left margin-right-sm small">
                    {moment( activity.createdAt ).format( 'LLL' )}
                  </label>
                  <p dangerouslySetInnerHTML={{ __html: formatActivity( activity ) }} />
                </li>
              ) )}
            </ul>}

            {(!activities || activities.length === 0) && <div className="margin-bottom-sm">
              {getLabel( 'noActivity' )}
            </div>}

            {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
              <Spinner />
            </div>}
          </div>
        </div>
      </div>
    );

  }

};
