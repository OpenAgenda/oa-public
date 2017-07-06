import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';
import moment from 'moment';
import throttle from 'lodash/throttle';
import Spinner from 'react-form-components/build/Spinner';
import monitorBottomHit from 'dom-utils/monitorBottomHit';
import activityFormatMaker from 'activities/formatActivity';
import activityLabels from 'labels/activities/user';
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
    lastPage: state.activities.lastPage
  }),
  { ...activitiesActions }
)
export default class UserDashboard extends Component {

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

  nextPage = () => {
    const { loading, nextLoading, activities, query, nextPage, lastPage } = this.props;
    if ( !activities || !activities.length || loading || nextLoading || lastPage ) return;
    nextPage( query, activities[ activities.length - 1 ].id );
  };

  render() {
    const { activities, nextLoading } = this.props;
    const { getLabel, lang } = this.context;

    return (
      <div className="content">
        <h2 className="margin-bottom-md">{getLabel( 'activities' )}</h2>

        {(activities && activities.length > 0) && <ul className="list-unstyled">
          {activities.map( activity => (
            <li key={activity.id} className="padding-bottom-xs">
              <label className="pull-left margin-right-sm small">
                {moment( activity.createdAt ).format( 'LLL' )}
              </label>
              <p className="activity-item" dangerouslySetInnerHTML={{ __html: formatActivity( activity, lang ) }} />
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
    );

  }

};
