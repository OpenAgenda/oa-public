import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { provideHooks } from 'redial';
import { getContext } from 'recompose';
import qs from 'qs';
import Spinner from '@openagenda/react-components/build/Spinner';
import { ConversationForm, AuthorAvatar, Breadcrumb } from '../../components';
import * as conversationFormActions from '../../redux/modules/conversationForm';
import * as inboxActions from '../../redux/modules/inbox';
import * as conversationActions from '../../redux/modules/conversation';
import * as modalActions from '../../redux/modules/modals';
import removeTrailingSlash from '../../utils/removeTrailingSlash';
import showBackLink from '../../utils/showBackLink';
import setFlashMessage from '../../utils/setFlashMessage';

async function asyncLoad( { store: { dispatch, getState } } ) {
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

@provideHooks( {
  fetch: async ( { store } ) => {
    const promise = asyncLoad( { store } );

    return Promise.resolve( __CLIENT__ ? null : promise );
  }
} )
@connect(
  ( state, props ) => {
    const query = qs.parse( props.location.search, { ignoreQueryPrefix: true } );

    return {
      initialValues: query.origin
        ? _.merge( state.settings.defaultQuery, { params: { origin: query.origin } } )
        : state.settings.defaultQuery,
      settings: state.settings,
      conversations: state.inbox.data,
      author: state.conversation.author,
      loading: state.inbox.loading || state.conversation.authorFetching,
      loaded: state.inbox.loaded && state.conversation.author,
      agenda: state.agenda,
      res: state.res
    };
  },
  {
    ...conversationFormActions,
    ...modalActions,
    attachFileToMessage: conversationActions.attachFileToMessage
  }
)
@getContext( {
  getLabel: PropTypes.func,
  store: PropTypes.object
} )
@withRouter
export default class ConversationCreate extends Component {
  FormWrapper = ( { handleSubmit, children, submitting, error } ) => {
    const { getLabel, settings, author } = this.props;
    const { belowMessageDesc } = settings;

    return (
      <form onSubmit={handleSubmit} className="conversation-form margin-bottom-md">
        {children}

        {error ? <p className="text-danger">{error}</p> : null}

        {author.inbox && author.inbox.type !== 'user' && author.inboxUser
          ? <div className="margin-bottom-xs">{getLabel( 'yourMessageWillBeSigned' )} <b>{author.inbox.name}</b></div>
          : null}

        {belowMessageDesc
          ? <div className="margin-bottom-xs" dangerouslySetInnerHTML={{ __html: belowMessageDesc }}/>
          : null}

        <button type="submit" className="btn btn-primary margin-top-xs">
          {getLabel( 'send' )}

          {submitting && (
            <span className="margin-h-sm">
              <Spinner mode="inline" />
            </span>
          )}
        </button>
      </form>
    );
  }

  render() {
    const {
      loading, loaded, createConversation, initialValues, getLabel, res,
      settings, conversations, author, history, showModal,
      attachFileToMessage, agenda
    } = this.props;

    const {
      prefix, ContentWrapper, creationDescriptionLabel,
      maskCreationSubtitle, creationSubtitle, creationDesc,
      onConversationCreateRedirect, onConversationCreateFlash
    } = settings;

    const content = loading || !loaded
      ? <div className="text-center padding-v-md">
        <Spinner loading={loading} mode="inline" options={{
          width: 1,
          length: 6,
          radius: 10,
          color: '#666'
        }}/>
      </div>
      : (
        <Fragment>
          {maskCreationSubtitle
            ? (
              <div className="inbox-head">
                <Breadcrumb/>
              </div>
            ) : (
              <div className="inbox-head">
                <Breadcrumb
                  breadParts={[ {
                    component: creationSubtitle ? creationSubtitle : getLabel( 'newConversation' )
                  } ]}
                  disableFirstPartLink={!showBackLink( settings, conversations )}
                />
              </div>
            )}

          {creationDesc ? <p dangerouslySetInnerHTML={{ __html: creationDesc }}/> : null}

          {creationDescriptionLabel ? <p>{creationDescriptionLabel}</p> : null}

          <div className="media">
            <div className="media-left">
              <AuthorAvatar author={author}/>
            </div>
            <div className="media-body">
              <h4 className="media-heading margin-bottom-sm">{getAuthorName( author )}</h4>

              <ConversationForm
                initialValues={initialValues}
                Wrapper={this.FormWrapper}
                onSubmit={createConversation}
                uploadEndpoint={res.messages.prepareAttachment.replace( ':agendaUid', agenda && agenda.uid ) + '/s3/params'}
                onConversationCreate={conversation => {
                  if ( onConversationCreateRedirect ) {
                    if ( onConversationCreateFlash ) {
                      setFlashMessage( onConversationCreateFlash );
                    }

                    window.location.href = onConversationCreateRedirect;
                  } else {
                    const url = removeTrailingSlash( prefix ) + `/conversation/${conversation.id}`;
                    history.push( url );

                    if ( onConversationCreateFlash ) {
                      showModal( 'messageSent', { message: onConversationCreateFlash } );
                    } else {
                      showModal( 'messageSent' );
                    }
                  }
                }}
                onFileUploaded={attachFileToMessage}
                autoFocus={settings.autoFocus}
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
