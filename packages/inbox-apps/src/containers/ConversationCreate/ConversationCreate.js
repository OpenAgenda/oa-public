import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { getContext } from 'recompose';
import { ConversationForm, LinkContainer, AuthorAvatar } from '../../components';
import * as conversationFormActions from '../../redux/modules/conversationForm';
import * as inboxActions from '../../redux/modules/inbox';
import * as conversationActions from '../../redux/modules/conversation';
import * as modalActions from '../../redux/modules/modals';
import removeTrailingSlash from '../../utils/removeTrailingSlash';
import showBackLink from '../../utils/showBackLink';

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
  { ...conversationFormActions, ...modalActions }
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
    const { getLabel, settings, author } = this.props;
    const { belowMessageDesc } = settings;

    return (
      <form onSubmit={handleSubmit} className="conversation-form margin-bottom-md">
        {children}

        {author.inbox && author.inbox.type !== 'user' && author.inboxUser
          ? <div className="margin-bottom-xs">{getLabel( 'yourMessageWillBeSigned' )} <b>{author.inbox.name}</b></div>
          : null}

        {belowMessageDesc
          ? <div className="margin-bottom-xs" dangerouslySetInnerHTML={{ __html: belowMessageDesc }}/>
          : null}

        <button type="submit" className="btn btn-primary margin-top-xs">{getLabel( 'send' )}</button>
      </form>
    );
  }

  render() {
    const {
      createConversation, initialValues, getLabel,
      settings, conversations, author, router, showModal
    } = this.props;

    const {
      TitleComponent, prefix, ContentWrapper, creationDescriptionLabel,
      maskCreationSubtitle, creationSubtitle
    } = settings;

    const content = (
      <Fragment>
        {maskCreationSubtitle ? null : <TitleComponent>
          {creationSubtitle ? creationSubtitle : getLabel( 'newConversation' )}
        </TitleComponent>}

        {showBackLink( settings, conversations ) ? <div className="text-right margin-bottom-sm">
          <LinkContainer to="/">
            {path => (
              <button
                className="btn btn-info btn-back"
                onClick={() => router.push( { pathname: path, state: { showListAllowed: true } } )}
              >
                {getLabel( 'showAllConversations' )}
              </button>
            )}
          </LinkContainer>
        </div> : null}

        <div className="clearfix"/>

        {creationDescriptionLabel ? <p>{creationDescriptionLabel}</p> : null}

        <div className="media">
          <div className="media-left">
            <AuthorAvatar author={author}/>
          </div>
          <div className="media-body">
            <h4 className="media-heading margin-bottom-sm">{getAuthorName( author )}</h4>

            <ConversationForm
              form="conversation-create"
              onSubmit={data => createConversation( data )
                .then( result => {
                  const url = removeTrailingSlash( prefix ) + `/conversation/${result.conversation.id}`;
                  router.push( url );
                  showModal( 'messageSent' );
                  return result;
                } )
                .catch( err => {
                  console.log( 'ERROR', err );
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
