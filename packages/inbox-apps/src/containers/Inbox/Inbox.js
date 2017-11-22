import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { push } from 'react-router-redux';
import { getContext } from 'recompose';
import Waypoint from 'react-waypoint';
import classNames from 'classnames';
import Spinner from '@openagenda/react-components/build/Spinner';
import { Title, ConversationList, LinkContainer } from '../../components';
import * as inboxActions from '../../redux/modules/inbox';
import removeTrailingSlash from '../../utils/removeTrailingSlash';

@asyncConnect( [ {
  promise: async ( { store: { dispatch, getState }, helpers: { redirect } } ) => {
    const state = getState();

    const { prefix, focusFistConversation, hideEmptyList } = state.settings;
    const query = focusFistConversation ? { limit: 1 } : {}

    const result = await dispatch( inboxActions.load( query ) );

    if ( hideEmptyList && (result.conversations && !result.conversations.length) ) {
      return redirect( removeTrailingSlash( prefix ) + '/conversation/create' );
    }

    if ( focusFistConversation ) {
      return redirect( `${removeTrailingSlash( prefix )}/conversation/${result.conversations[ 0 ].id}` );
    }
  }
} ] )
@connect(
  state => ({
    settings: state.settings,
    conversations: state.inbox.data,
    loading: state.inbox.loading,
    nextLoading: state.inbox.nextLoading,
    lastPage: state.inbox.lastPage
  }),
  { ...inboxActions, push }
)
@getContext( {
  getLabel: PropTypes.func
} )
export default class Inbox extends Component {
  nextPage = () => {
    const { lastPage, loading, nextLoading, conversations } = this.props;

    if (
      !conversations || !conversations.length
      || loading || nextLoading
      || lastPage
    ) {
      return;
    }

    this.props.nextPage();
  };

  throttledNextPage = _.throttle( this.nextPage, 400, { trailing: false } );

  render() {
    const {
      conversations, nextLoading, push, getLabel,
      settings: { TitleComponent, ContentWrapper, allowCreateConversation }
    } = this.props;

    const content = [
      conversations && conversations.length ? <ConversationList conversations={conversations} key="list" /> : null,

      !conversations || !conversations.length ?
        <div
          className="text-center text-muted padding-v-md"
          key="zero"
        >
          {getLabel( 'noResult' )}
        </div> :
        null,

      nextLoading && <div className="padding-v-md" style={{ position: 'relative' }} key="spinner">
        <Spinner />
      </div>,

      <Waypoint onEnter={this.throttledNextPage} key="waypoint" />
    ];

    return [
      <Title
        tab="inbox"
        key="title"
        Component={TitleComponent}
        className={classNames( {
          'pull-left': allowCreateConversation
        } )}
      />,

      allowCreateConversation && <div key="button-create" className="text-right">
        <LinkContainer to="/conversation/create">
          {path => (
            <button
              className="btn btn-info margin-top-md"
              onClick={() => push( path )}
            >
              {getLabel( 'createConversation' )}
            </button>
          )}
        </LinkContainer>
      </div>,

      ...(ContentWrapper
          ? [ <ContentWrapper key="contentWrapper">{content}</ContentWrapper> ]
          : content
      )
    ];
  }
};
