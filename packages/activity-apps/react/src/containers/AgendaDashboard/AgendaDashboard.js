import React, { Component, PropTypes } from 'react';
import { asyncConnect } from 'redux-connect';
import moment from 'moment';
import classNames from 'classnames';
import activityFormatMaker from 'activities/format';
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
    lastPage: state.activities.lastPage
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

  componentWillMount() {

    const { lang } = this.context;
    moment.locale( lang );

  }

  nextPage = () => {
    const { loading, nextLoading, activities, query, nextPage, lastPage } = this.props;
    if ( !activities || !activities.length || loading || nextLoading || lastPage ) return;
    nextPage( query, activities[ activities.length - 1 ].id );
  };

  render() {
    const { activities, lastPage, loading, nextLoading } = this.props;
    const { getLabel, lang } = this.context;

    return (
      <div>
        <h2>{getLabel( 'activities' )}</h2>

        <div className="padding-top-md">
          {activities.map( activity => (
            <div key={activity.id} className="margin-bottom-sm">
              <strong>{moment( activity.createdAt ).format( 'LLL' )}:</strong>{' '}
              <span dangerouslySetInnerHTML={{ __html: formatActivity( activity, lang ) }} />
            </div>
          ) )}

          <div className="text-center">
            <button
              className={classNames( 'btn', 'btn-default', { disabled: lastPage || nextLoading || loading } )}
              onClick={this.nextPage}
            >
              {getLabel( 'next' )}
            </button>
          </div>
        </div>
      </div>
    );

  }

};
