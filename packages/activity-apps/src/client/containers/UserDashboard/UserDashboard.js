import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';
import Waypoint from 'react-waypoint';
import Spinner from '@openagenda/react-form-components/build/Spinner';
import * as activitiesActions from '../../redux/modules/activities';
import { ActivityItem } from '../../components';

@provideHooks( {
  fetch: async ( { store: { dispatch, getState } } ) => {
    const state = getState();
    const query = state.router.location.query;
    const promises = [];

    if ( !activitiesActions.isLoaded( state ) ) {
      promises.push( dispatch( activitiesActions.load( query ) ) );
    }

    return Promise.all( __CLIENT__ ? [] : promises );
  }
} )
@connect(
  ( state, props ) => ({
    res: state.res,
    activities: state.activities.data,
    fromId: state.activities.fromId,
    loading: state.activities.loading,
    nextLoading: state.activities.nextLoading,
    lastPage: state.activities.lastPage,
    query: _.pick( props.location.query, [ 'actor', 'verb', 'object', 'target' ] )
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
    lang: PropTypes.string,
    labels: PropTypes.object,
    getLabel: PropTypes.func
  };

  nextPage = () => {
    const { loading, nextLoading, activities, query, nextPage, lastPage } = this.props;
    if ( !activities || !activities.length || loading || nextLoading || lastPage ) return;
    nextPage( query, activities[ activities.length - 1 ].id );
  };

  throttledNextPage = _.throttle( this.nextPage, 400, { trailing: false } );

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

        <Waypoint onEnter={this.throttledNextPage} />
      </div>
    );

  }

};
