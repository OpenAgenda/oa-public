import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { getContext } from 'recompose';
import { ConversationForm, Link, MessageAvatar } from '../../components';
import * as conversationFormActions from '../../redux/modules/conversationForm';
import * as inboxActions from '../../redux/modules/inbox';
import * as conversationActions from '../../redux/modules/conversation';
import removeTrailingSlash from '../../utils/removeTrailingSlash';

@asyncConnect( [ {
  promise: async ( { store: { dispatch, getState } } ) => {
    const state = getState();

    const { focusFistConversation } = state.settings;
    const query = focusFistConversation ? { limit: 1 } : {};

    if ( !inboxActions.isLoaded( state ) ) {
      await dispatch( inboxActions.load( query ) );
    }

    if ( !conversationActions.isAuthorLoaded( state ) ) {
      return dispatch( conversationActions.loadAuthor() );
    }
  }
} ] )
@connect(
  state => ({
    initialValues: state.settings.defaultQuery,
    settings: state.settings,
    conversations: state.inbox.data,
    author: state.conversation.author
  }),
  conversationFormActions
)
@getContext( {
  getLabel: PropTypes.func
} )
export default class ConversationCreate extends Component {
  constructor( props ) {
    super( props );
    this.FromWrapper = ::this.FromWrapper;
  }

  FromWrapper( { handleSubmit, children } ) {
    const { getLabel } = this.props;

    return (
      <form onSubmit={handleSubmit} className="conversation-form">
        <div className="margin-bottom-md">
          {children}
        </div>

        <button type="submit" className="btn btn-primary">{getLabel( 'send' )}</button>
      </form>
    );
  }

  render() {
    const {
      createConversation, initialValues, getLabel,
      settings, conversations, author, router
    } = this.props;

    const { TitleComponent, prefix, focusFistConversation, hideEmptyList, ContentWrapper } = settings;

    // IF focusFistConversation AND !hideEmptyList AND conversations list not empty
    // OR lastConversation resolved
    const showBackLink = (!focusFistConversation && (!hideEmptyList && conversations && !conversations.length))
      || (conversations && conversations.length && conversations[ 0 ].resolvedAt);

    const content = (
      <Fragment>
        <TitleComponent>
          {getLabel( 'newConversation' )}
        </TitleComponent>

        {showBackLink ? <div>
          <Link to="/">{getLabel( 'backToConversations' )}</Link>
        </div> : null}

        <div className="media">
          <div className="media-left">
            <MessageAvatar message={author}/>
          </div>
          <div className="media-body">
            <h4 className="media-heading margin-bottom-sm">{getAuthorName( author )}</h4>

            <ConversationForm
              onSubmit={data => createConversation( data )
                .then( result => {
                  const url = removeTrailingSlash( prefix ) + `/conversation/${result.conversation.id}`;
                  router.push( url );
                  return result;
                } )
              }
              initialValues={initialValues}
              Wrapper={this.FromWrapper}
            />
          </div>
        </div>
      </Fragment>
    );

    return ContentWrapper
      ? <ContentWrapper>{content}</ContentWrapper>
      : content;
  }
}

function getAuthorName( obj ) {
  if ( obj.inboxUser ) {
    return obj.inboxUser.name;
  }

  return obj.inbox.name;
}
