import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { reset as resetForm } from 'redux-form';
import Waypoint from 'react-waypoint';
import { getContext } from 'recompose';
import Spinner from '@openagenda/react-components/build/Spinner';
import { Title, MessageList, MessageForm, MessageAvatar, ActionsList, Link } from '../../components';
import * as conversationActions from '../../redux/modules/conversation';

@asyncConnect( [ {
  promise: ( { store: { dispatch, getState }, router } ) => {
    const state = getState();
    const promises = [];

    if ( !conversationActions.isAuthorLoaded( state ) ) {
      promises.push( dispatch( conversationActions.loadAuthor() ) );
    }

    // if ( !conversationActions.isLoaded( state ) ) {
    promises.push( dispatch( conversationActions.load( router.params.conversationId ) ) );
    // }

    return Promise.all( promises );
  }
} ] )
@asyncConnect( [ {
  promise: ( { store: { dispatch, getState } } ) => {
    const state = getState();

    if ( !conversationActions.isAuthorLoaded( state ) ) {
      return dispatch( conversationActions.loadAuthor() );
    }
  }
} ] )
@connect(
  state => ({
    settings: state.settings,
    author: state.conversation.author,
    conversation: state.conversation.data,
    messages: state.conversation.messages,
    loading: state.conversation.loading,
    nextLoading: state.conversation.nextLoading,
    lastPage: state.conversation.lastPage,
    res: state.res
  }),
  { ...conversationActions, resetForm }
)
@getContext( {
  getLabel: PropTypes.func
} )
export default class Conversation extends Component {
  constructor( props ) {
    super( props );
    this.renderForm = ::this.renderForm;
    this.FromWrapper = ::this.FromWrapper;
  }

  nextPage = () => {
    const { lastPage, loading, nextLoading, messages, router } = this.props;

    if (
      !messages || !messages.length
      || loading || nextLoading
      || lastPage
    ) {
      return;
    }

    this.props.nextPage( router.params.conversationId );
  };

  sendMessage = async data => {
    const { router, sendMessage, resetForm } = this.props;
    await sendMessage( router.params.conversationId, data );

    resetForm( 'message' );
  }

  throttledNextPage = _.throttle( this.nextPage, 400, { trailing: false } );

  FromWrapper( { children, handleSubmit, submitting } ) {
    const { getLabel, author, messages } = this.props;

    return (
      <div className="media">
        <div className="media-left media-top">
          <MessageAvatar message={author} />
        </div>

        <div className="media-body">
          <p className="author-name">{getAuthorName( author )}</p>

          <form onSubmit={handleSubmit} className="message-form">
            {children}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary margin-bottom-sm"
            >
              {getLabel( messages && messages.length ? 'reply' : 'submit' )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  renderForm() {
    const { conversation, triggerAction, getLabel } = this.props;

    if ( conversation.resolvedAt ) {
      return (
        <div className="well text-center margin-top-sm" key="message-form">
          <i className="fa fa-lock text-muted" aria-hidden="true"></i>{' '}
          {getLabel( 'conversationAreResolved' )}
        </div>
      );
    }

    if ( !conversation.actions ) {
      return (
        <MessageForm
          form="message"
          onSubmit={this.sendMessage}
          key="message-form"
          Wrapper={this.FromWrapper}
        />
      );
    }

    return (
      <div className="row" key="message-form">
        <div className="col-sm-10">
          <MessageForm
            form="message"
            onSubmit={this.sendMessage}
            Wrapper={this.FromWrapper}
          />
        </div>
        <div className="col-sm-2">
          <p><b>{getLabel( 'actions' )}</b></p>

          <div className="text-center">
            <ActionsList
              onAction={triggerAction.bind( null, conversation.id )}
              actions={conversation.actions}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      messages, nextLoading, res, getLabel,
      settings: { TitleComponent, ContentWrapper, focusFistConversation }
    } = this.props;

    const content = [
      !focusFistConversation && <div key="return-to-inbox">
        <Link to={res.inboxHome}>{getLabel( 'backToConversations' )}</Link>
      </div>,

      this.renderForm(),

      messages && messages.length && <MessageList messages={messages} key="list" />,

      !messages || !messages.length && <div className="text-center text-muted margin-v-md" key="zero">
        {getLabel( 'noResult' )}
      </div>,

      nextLoading && <div className="padding-v-md" style={{ position: 'relative' }} key="spinner">
        <Spinner />
      </div>,

      <Waypoint onEnter={this.throttledNextPage} key="waypoint" />
    ];

    return [
      <Title
        tab="conversation"
        key="title"
        Component={TitleComponent}
      />,

      ...(ContentWrapper
          ? [ <ContentWrapper key="contentWrapper">{content}</ContentWrapper> ]
          : content
      )
    ];
  }
}

function getAuthorName( author ) {
  if ( author.inboxUser ) {
    return author.inboxUser.name;
  }

  return author.inbox.name;
}
