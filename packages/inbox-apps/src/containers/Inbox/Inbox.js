import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { getContext } from 'recompose';
import Waypoint from 'react-waypoint';
import Spinner from '@openagenda/react-components/build/Spinner';
import nl2br from '@openagenda/react-utils/dist/nl2br';
import { Breadcrumb, ConversationList, LinkContainer, AuthorAvatar, ConversationForm } from '../../components';
import * as inboxActions from '../../redux/modules/inbox';
import * as conversationActions from '../../redux/modules/conversation';
import * as conversationFormActions from '../../redux/modules/conversationForm';
import * as modalActions from '../../redux/modules/modals';
import removeTrailingSlash from '../../utils/removeTrailingSlash';
import setFlashMessage from '../../utils/setFlashMessage';

function asyncLoad( { store: { getState, dispatch }, redirect } ) {
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
        return true;
      }

      if ( (hideEmptyList) && result.conversations && !result.conversations.length ) {
        return redirect( removeTrailingSlash( prefix ) + '/conversation/create' );
      }

      if ( focusFistConversation ) {
        if ( result.conversations && !result.conversations.length ) {
          return redirect( removeTrailingSlash( prefix ) + '/conversation/create' );
        } else if ( result.conversations && result.conversations.length && !result.conversations[ 0 ].closedAt ) {
          return redirect( `${removeTrailingSlash( prefix )}/conversation/${result.conversations[ 0 ].id}` );
        }
      }

      return true;

    } );
}

@asyncConnect( [ {
  key: 'asyncConnectInbox',
  promise: ( { store, helpers: { redirect } } ) => {
    if ( !__SERVER__ ) return { needLoad: true };
    return asyncLoad( { store, redirect } );
  }
} ] )
@connect(
  ( state, props ) => ({
    initialValues: props.location.query.origin
      ? _.merge( state.settings.defaultQuery, { params: { origin: props.location.query.origin } } )
      : state.settings.defaultQuery,
    settings: state.settings,
    user: state.user,
    conversations: state.inbox.data,
    loading: state.inbox.loading,
    nextLoading: state.inbox.nextLoading,
    lastPage: state.inbox.lastPage,
    author: state.conversation.author,
    agenda: state.agenda,
    res: state.res
  }),
  { ...conversationActions, ...inboxActions, ...conversationFormActions, ...modalActions }
)
@getContext( {
  getLabel: PropTypes.func,
  store: PropTypes.object
} )
export default class Inbox extends Component {
  constructor( props ) {
    super( props );
    this.FromWrapper = ::this.FromWrapper;
    this.renderCreationButton = ::this.renderCreationButton;
  }

  state = {
    loading: false,
    loaded: this.props.asyncConnectInbox ? !this.props.asyncConnectInbox.needLoad : false,
    error: null
  };

  componentDidMount() {
    const { store, router } = this.props;

    if ( !this.state.loaded && !this.state.loading ) {
      this.setState( {
        loading: true,
        loaded: false,
        error: null
      } );

      asyncLoad( { store, redirect: router.replace } )
        .then( () => {
          this.setState( {
            loading: false,
            loaded: true,
            error: null
          } );
        }, error => {
          this.setState( {
            loading: false,
            loaded: false,
            error
          } );
        } );
    }
  }

  FromWrapper( { handleSubmit, error, children } ) {
    const { getLabel, settings, author } = this.props;
    const { belowMessageDesc } = settings;

    return (
      <form onSubmit={handleSubmit} className="conversation-form margin-bottom-md">
        {children}

        {error ? <p className="text-danger">{error}</p> : null}

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

  renderCreationButton( { unclosedConvs } ) {
    const { settings, router, getLabel } = this.props;
    const { allowCreateConversation, topListForm, creationButtonLabel, allClosedForCreate } = settings;

    const creationButton = (
      <LinkContainer to="/conversation/create">
        {path => (
          <button
            className="btn btn-info btn-creation pull-right"
            onClick={() => router.push( path )}
          >
            {creationButtonLabel ? creationButtonLabel : getLabel( 'createConversation' )}
          </button>
        )}
      </LinkContainer>
    );

    if ( allClosedForCreate && unclosedConvs.length ) {
      return null;
    }

    return allowCreateConversation && !topListForm ? creationButton : null;
  }

  render() {
    const {
      conversations, nextLoading, router, getLabel, showModal,
      createConversation, author, initialValues, settings, user,
      attachFileToMessage, res, agenda
    } = this.props;

    const {
      ContentWrapper, topListForm, prefix, emptyInboxLabel,
      creationSubtitle, maskCreationSubtitle, creationDesc,
      onConversationCreateRedirect, onConversationCreateFlash,
      displayHelp, allowCreateConversation, focusFistConversation
    } = settings;

    const [ unclosedConvs, closedConvs ] = _.partition( conversations, o => !o.closedAt );

    const content = this.state.loading || !this.state.loaded
      ? <div className="text-center padding-v-md">
        <Spinner loading={this.state.loading} mode="inline" options={{
          width: 1,
          length: 6,
          radius: 10,
          color: '#666'
        }}/>
      </div>
      : (
        <Fragment>
          <div className="inbox-head">
            {this.renderCreationButton( { unclosedConvs } )}

            {displayHelp ? (
              <a
                title={getLabel( 'needHelp' )}
                target="_blank"
                href="https://openagenda.zendesk.com/hc/fr/articles/360000370713"
                className="pull-right"
              >
                <i className="fa fa-question-circle"></i>
              </a>
            ) : null}

            {topListForm && ((allowCreateConversation && !focusFistConversation) || !unclosedConvs.length) && !maskCreationSubtitle
              ? (
                <Breadcrumb
                  breadParts={[ {
                    component: creationSubtitle ? creationSubtitle : getLabel( 'newConversation' )
                  } ]}
                  disableFirstPartLink
                />
              ) : <Breadcrumb/>}
          </div>

          {topListForm && ((allowCreateConversation && !focusFistConversation) || !unclosedConvs.length) ? <Fragment>
            {creationDesc ? <p dangerouslySetInnerHTML={{ __html: creationDesc }}/> : null}

            <div className="media">
              <div className="media-left">
                <AuthorAvatar author={author}/>
              </div>
              <div className="media-body">
                <h4 className="media-heading margin-bottom-sm">{getAuthorName( author )}</h4>

                <ConversationForm
                  form="inbox-conversation-create"
                  initialValues={initialValues}
                  Wrapper={this.FromWrapper}
                  uploadEndpoint={res.messages.prepareAttachment.replace( ':agendaUid', agenda && agenda.uid ) + '/s3/params'}
                  onSubmit={createConversation}
                  onConversationCreate={conversation => {
                    if ( onConversationCreateRedirect ) {
                      if ( onConversationCreateFlash ) {
                        setFlashMessage( onConversationCreateFlash );
                      }

                      window.location.href = onConversationCreateRedirect;
                    } else {
                      const url = removeTrailingSlash( prefix ) + `/conversation/${conversation.id}`;
                      router.push( url );

                      if ( onConversationCreateFlash ) {
                        showModal( 'messageSent', { message: onConversationCreateFlash } );
                      } else {
                        showModal( 'messageSent' );
                      }
                    }
                  }}
                  onFileUploaded={attachFileToMessage}
                />
              </div>
            </div>
          </Fragment> : null}

          {conversations && conversations.length ? <h4 className="margin-bottom-md">
            {getLabel( !unclosedConvs.length ? 'pastConversations' : 'ongoingConversations' )}
          </h4> : null}

          {unclosedConvs.length
            ? <ConversationList conversations={unclosedConvs} user={user}/>
            : <ConversationList conversations={closedConvs} user={user}/>}

          {unclosedConvs.length && closedConvs.length ? <Fragment>
            <h4 className="margin-bottom-md">
              {getLabel( 'pastConversations' )}
            </h4>

            <ConversationList conversations={closedConvs} user={user}/>
          </Fragment> : null}

          {/*{conversations && conversations.length ? <ConversationList conversations={conversations}/> : null}*/}

          {!conversations || !conversations.length ?
            <div className="padding-v-md">
              {nl2br( emptyInboxLabel ? emptyInboxLabel : getLabel( 'noResult' ) )}
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
