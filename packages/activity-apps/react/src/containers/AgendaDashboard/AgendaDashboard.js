import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';
import moment from 'moment';
import pick from 'lodash/pick';
import throttle from 'lodash/throttle';
import mapValues from 'lodash/mapValues';
import update from 'immutability-helper';
import Spinner from '@openagenda/react-form-components/build/Spinner';
import monitorBottomHit from 'dom-utils/monitorBottomHit';
import activityFormatMaker from 'activities/formatActivity';
import activityLabels from 'labels/activities/agenda';
import * as activitiesActions from '../../redux/modules/activities';

import 'moment/locale/fr';

const formatActivity = activityFormatMaker( {}, activityLabels );

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
    res: state.res,
    activities: state.activities.data,
    fromId: state.activities.fromId,
    loading: state.activities.loading,
    nextLoading: state.activities.nextLoading,
    lastPage: state.activities.lastPage,
    query: pick( props.location.query, [ 'actor', 'verb', 'object', 'target' ] )
  }),
  { ...activitiesActions }
)
export default class AgendaDashboard extends Component {

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
    lang: PropTypes.string,
    getLabel: PropTypes.func
  };

  constructor( props ) {
    super( props );

    this.onActivityClick = ::this.onActivityClick;
    this.nextPage = ::this.nextPage;
    this.getFilters = ::this.getFilters;
    this.removeFilter = ::this.removeFilter;
    this.updateMonitorBottomHit = ::this.updateMonitorBottomHit;
  }

  state = {
    filters: this.getFilters( pick( this.props.location.query, [ 'actor', 'verb', 'object', 'target' ] ) )
  };

  componentDidMount() {

    const { lang } = this.context;
    moment.locale( lang );

    if ( typeof document !== 'undefined' ) {
      monitorBottomHit( throttle( this.nextPage, 400, { trailing: false } ) );
    }

  }

  componentWillUnmount() {
    monitorBottomHit.stop();
  }

  updateMonitorBottomHit() {
    monitorBottomHit.stop();
    monitorBottomHit( throttle( this.nextPage, 400, { trailing: false } ) );
  }

  getFilters( values ) {
    const { activities } = this.props;

    const usefullActivities = {
      actor: activities.find( v => v.actor === values.actor ),
      verb: activities.find( v => v.verb === values.verb ),
      object: activities.find( v => v.object === values.object ),
      target: activities.find( v => v.target === values.target )
    };

    return mapValues( usefullActivities, ( v, k ) => v ? {
      label: v.store.labels[ k ],
      value: v[ k ]
    } : undefined );
  }

  removeFilter( type ) {
    const { list, location, query } = this.props;
    const { router } = this.context;

    this.setState( update( this.state, {
      filters: {
        $unset: [ type ]
      }
    } ), () => {
      list( { ...query, [ type ]: undefined } ).then( this.updateMonitorBottomHit )
    } );

    router.replace( {
      ...location,
      query: {
        ...location.query,
        [ type ]: undefined
      }
    } );
  }

  nextPage() {
    const { loading, nextLoading, activities, query, nextPage, lastPage } = this.props;
    if ( !activities || !activities.length || loading || nextLoading || lastPage ) return;
    nextPage( query, activities[ activities.length - 1 ].id );
  };

  onActivityClick( e ) {

    const { location, query, list } = this.props;
    const { router } = this.context;

    if (
      !e.target.hasAttribute( 'data-filtertype' )
      || !e.target.hasAttribute( 'data-filterlabel' )
      || !e.target.hasAttribute( 'data-filtervalue' )
    ) {
      return;
    }

    const type = e.target.getAttribute( 'data-filtertype' );
    const label = e.target.getAttribute( 'data-filterlabel' );
    const value = e.target.getAttribute( 'data-filtervalue' );

    this.setState( update( this.state, {
      filters: {
        [ type ]: {
          $set: {
            label,
            value
          }
        }
      }
    } ), () => {
      list( { ...query, [ type ]: value } ).then( this.updateMonitorBottomHit )
    } );

    router.replace( {
      ...location,
      query: {
        ...location.query,
        [ type ]: value
      }
    } );
  };

  getEventTitle( labels ) {

    if ( typeof labels !== 'object' ) return labels;

    const { lang } = this.props;
    const keys = Object.keys( labels );
    return keys.find( v => v === lang ) ? labels[ lang ] : labels[ keys[ 0 ] ];

  }

  render() {
    const { activities, nextLoading } = this.props;
    const { getLabel, lang } = this.context;

    return (
      <div>
        <h2>{getLabel( 'activities' )}</h2>

        <div className="margin-v-md">
          <ul className="nav nav-pills filters">
            {Object.values( mapValues( this.state.filters, ( v, k ) =>
              v && <li key={k} onClick={() => this.removeFilter( k )} className="active margin-right-sm">
                <a role="button">{this.getEventTitle( v.label )}</a>
              </li>
            ) )}
          </ul>
        </div>

        <div className="padding-top-md">
          {(activities && activities.length > 0) && <ul className="list-unstyled">
            {activities.map( activity => (
              <li key={activity.id} className="padding-bottom-xs">
                <label className="pull-left margin-right-sm small">
                  {moment( activity.createdAt ).format( 'LLL' )}
                </label>
                <p onClick={this.onActivityClick} className="activity-item"
                  dangerouslySetInnerHTML={{ __html: formatActivity( activity, lang, true ) }} />
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
    );

  }

};
