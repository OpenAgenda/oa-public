import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { getContext } from 'recompose';
import Waypoint from 'react-waypoint';
import Spinner from '@openagenda/react-components/build/Spinner';
import { ConversationList, LinkContainer, AuthorAvatar, ConversationForm } from '../../components';
import * as inboxActions from '../../redux/modules/inbox';
import * as conversationActions from '../../redux/modules/conversation';
import * as conversationFormActions from '../../redux/modules/conversationForm';
import * as modalActions from '../../redux/modules/modals';
import removeTrailingSlash from '../../utils/removeTrailingSlash';

@asyncConnect( [ {
  key: 'inbox', // key is usefull for the redirection
  promise: ( { store: { dispatch, getState }, helpers: { redirect } } ) => {
    const state = getState();
    const location = state.routing.locationBeforeTransitions;

    const { prefix, focusFistConversation, hideEmptyList, topListForm } = state.settings;
    const query = focusFistConversation ? { limit: 1 } : {};

    return dispatch( inboxActions.load( query ) )
      .then( async result => {

        if ( topListForm && !conversationActions.isAuthorLoaded( state ) ) {
          await dispatch( conversationActions.loadAuthor() );
        }

        if ( location.state && location.state.showListAllowed ) {
          return;
        }

        if ( (hideEmptyList) && result.conversations && !result.conversations.length ) {
          return redirect( removeTrailingSlash( prefix ) + '/conversation/create' );
        }

        if ( focusFistConversation ) {
          if ( result.conversations && !result.conversations.length ) {
            return redirect( removeTrailingSlash( prefix ) + '/conversation/create' );
          } else if ( result.conversations && result.conversations.length && !result.conversations[ 0 ].resolvedAt ) {
            return redirect( `${removeTrailingSlash( prefix )}/conversation/${result.conversations[ 0 ].id}` );
          }
        }

      } );
  }
} ] )
@connect(
  state => ({
    initialValues: state.settings.defaultQuery,
    settings: state.settings,
    conversations: state.inbox.data,
    loading: state.inbox.loading,
    nextLoading: state.inbox.nextLoading,
    lastPage: state.inbox.lastPage,
    author: state.conversation.author
  }),
  { ...conversationActions, ...inboxActions, ...conversationFormActions, ...modalActions }
)
@getContext( {
  getLabel: PropTypes.func
} )
export default class Inbox extends Component {
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
          ? <div className="margin-bottom-sm">
            {getLabel( 'yourMessageWillBeSigned' )} <b>{author.inbox.name}</b>
          </div>
          : null}

        {belowMessageDesc
          ? <div className="margin-bottom-xs" dangerouslySetInnerHTML={{ __html: belowMessageDesc }}/>
          : null}

        <button type="submit" className="btn btn-primary margin-top-xs">{getLabel( 'send' )}</button>
      </form>
    );
  }

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
      conversations, nextLoading, router, getLabel, showModal,
      createConversation, author, initialValues, settings
    } = this.props;

    const {
      TitleComponent, ContentWrapper, allowCreateConversation,
      topListForm, prefix, emptyInboxLabel, creationSubtitle,
      creationButtonLabel, maskCreationSubtitle, inboxDesc
    } = settings;

    const [ unresolvedConvs, resolvedConvs ] = _.partition( conversations, o => !o.resolvedAt );

    const content = (
      <Fragment>
        {topListForm && !unresolvedConvs.length ? <Fragment>
          {maskCreationSubtitle ? null : <TitleComponent>
            {creationSubtitle ? creationSubtitle : getLabel( 'newConversation' )}
          </TitleComponent>}

          {inboxDesc ? <p>{inboxDesc}</p> : null}

          <div className="media">
            <div className="media-left">
              <AuthorAvatar author={author}/>
            </div>
            <div className="media-body">
              <h4 className="media-heading margin-bottom-sm">{getAuthorName( author )}</h4>

              <ConversationForm
                form="inbox-conversation-create"
                onSubmit={data => createConversation( data )
                  .then( async result => {
                    const url = removeTrailingSlash( prefix ) + `/conversation/${result.conversation.id}`;
                    router.push( url );
                    showModal( 'messageSent' );
                    return result;
                  } )
                }
                initialValues={initialValues}
                Wrapper={this.FromWrapper}
              />
            </div>
          </div>
        </Fragment> : null}

        {conversations && conversations.length ? <TitleComponent>
          {getLabel( !unresolvedConvs.length ? 'pastConversations' : 'ongoingConversations' )}
        </TitleComponent> : null}

        {allowCreateConversation && !topListForm && <div className="text-right">
          <LinkContainer to="/conversation/create">
            {path => (
              <button
                className="btn btn-info btn-creation"
                onClick={() => router.push( path )}
              >
                {creationButtonLabel ? creationButtonLabel : getLabel( 'createConversation' )}
              </button>
            )}
          </LinkContainer>
        </div>}

        <div className="clearfix"/>

        {!unresolvedConvs.length
          ? <ConversationList conversations={resolvedConvs}/>
          : <ConversationList conversations={unresolvedConvs}/>}

        {unresolvedConvs.length && resolvedConvs.length ? <Fragment>
          <TitleComponent>
            {getLabel( 'pastConversations' )}
          </TitleComponent>

          <div className="clearfix"/>

          <ConversationList conversations={resolvedConvs}/>
        </Fragment> : null}

        {/*{conversations && conversations.length ? <ConversationList conversations={conversations}/> : null}*/}

        {!conversations || !conversations.length ?
          <div className="text-center text-muted padding-v-md">
            {emptyInboxLabel ? emptyInboxLabel : getLabel( 'noResult' )}
          </div> :
          null}

        {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
          <Spinner/>
        </div>}

        <Waypoint onEnter={this.throttledNextPage}/>
      </Fragment>
    );

    return ContentWrapper
      ? <ContentWrapper>{content}</ContentWrapper>
      : content;
  }
};

function getAuthorName( obj ) {
  if ( obj.inboxUser ) {
    return obj.inboxUser.name;
  }

  return obj.inbox.name;
}
