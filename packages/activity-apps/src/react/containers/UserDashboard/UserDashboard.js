import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';
import throttle from 'lodash/throttle';
import Spinner from '@openagenda/react-form-components/build/Spinner';
import monitorBottomHit from '@openagenda/dom-utils/monitorBottomHit';
import * as activitiesActions from '../../redux/modules/activities';

import { ActivityItem } from '../../components';
import labels from '@openagenda/labels/activities/event';

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
    labels: PropTypes.object,
    getLabel: PropTypes.func
  };

  componentDidMount() {

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
    const { labels, getLabel, lang } = this.context;

    return (
      <div className="content">
        <h2 className="margin-bottom-md">{getLabel( 'activities' )}</h2>

        {(activities && activities.length > 0) && <ul className="list-unstyled activity-list">
          {activities.map( a => <ActivityItem key={'activity.'+a.id} activity={a} labels={labels} lang={lang} /> )}
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
