"use strict";

var React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),

xhr = require( 'xhr' ),

Spinner = require( '@openagenda/spinner' ),

labels = {
  request: {
    fr: 'Demandez l\'activation de cette fonctionnalité',
    en: 'Send a request to try out this feature'
  },
  send: {
    fr: 'Envoyer',
    en: 'Send'
  },
  sentMessage: {
    fr: 'Merci, votre demande sera traitée sous peu',
    en: 'Thanks, your request will be processed shortly'
  },
  emptyError: {
    fr: 'Détaillez en quelques mots votre cas d\'utilisation pour cette fonction',
    en: 'Thanks for giving us some detail on your use case for this feature'
  },
  requestError: {
    fr: 'Il y a eu un problème lors du transfer du message, merci de réessayer plus tard',
    en: 'There was a problem during the transfer of the message, thanks for trying again later'
  },
  done: {
    fr: 'Ok',
    en: 'Ok'
  }
};

module.exports = createReactClass( {

  getInitialState: function() {

    return {
      message: '',
      error: false,
      display: false,
      sent: false,
      loading: false,
      done: false
    }

  },

  getLabel: function( name ) {

    if ( this.props.labels[ name ] ) {

      return this.props.labels[ name ][ this.props.lang ];

    }

    return labels[ name ][ this.props.lang ];

  },

  onTeaserClick: function( e ) {

    e.preventDefault();

    this.setState( {
      display: true
    } );

  },

  onCanvasClick: function( e ) {

    if ( this.refs.popupcanvas == e.target ) this.onHide( e );

  },

  onHide: function( e ) {

    e.preventDefault();

    this.setState( {
      display: false
    } );

  },

  onChange: function( e ) {

    this.setState( {
      message: e.target.value
    } );

  },

  onDoneClick: function() {

    this.setState( {
      done: true
    } );

  },

  onSubmit: function() {

    var self = this;

    if ( !this.state.message.length ) {

      this.setState( {
        error: this.getLabel( 'emptyError' )
      } );

      return;

    }

    this.setState( {
      loading: true
    } );

    xhr( {
      uri: this.props.res,
      method: 'post',
      json: {
        title: this.getLabel( 'title' ),
        message: this.state.message,
        source: window.location.href
      }
    }, function( err, res ) {

      var update = {
        loading: false
      }

      if ( !err && res.statusCode !== 200 ) {

        err = res.statusCode;

        update.error = self.getLabel( 'requestError' );

      } else {

        update.sent = true;

      }

      self.setState( update );

    });

  },

  renderSentMessage: function() {

    return <div className="text-center">
      <p>{this.getLabel( 'sentMessage' )}</p>
      <div>
        <button onClick={this.onDoneClick} className="btn btn-primary">{this.getLabel('done')}</button>
      </div>
    </div>

  },

  renderForm: function() {

    return <div>
      <p>{this.getLabel( 'description' )}</p>
      <div className="form-group">
        <p>{this.getLabel( 'request' )}</p>
        <textarea cols="4" onChange={this.onChange} className="form-control" />
      </div>
      <div className="form-group">
        {this.state.error?<p className="error">{this.state.error}</p>:''}
        <button onClick={this.onSubmit} className="btn btn-primary">{this.getLabel( 'send' )}</button>
      </div>
    </div>

  },

  renderFeature: function() {

    return <div className="popup-overlay" ref="popupcanvas" onClick={this.onCanvasClick}>
      <section>
        <header className="popup-title">
          <h2>{this.getLabel( 'title' )}</h2>
          <a onClick={this.onHide} className="close-link">
            <i className="fa fa-times fa-lg"></i>
          </a>
        </header>
        <div className="popup-content">
          {this.state.sent ? this.renderSentMessage() : this.renderForm()}
        </div>
        <Spinner loading={this.state.loading}/>
      </section>
    </div>

  },

  renderTeaser: function() {

    return <div className="form-group">

      <button className="btn btn-default" onClick={this.onTeaserClick}>
        <i className="fa fa-lock"></i>  
        <span> {this.getLabel( 'teaser' )}</span>
      </button>

    </div>

  },

  render: function() {

    if ( this.state.done ) return <div></div>;

    return <div className="feature-request">
      {this.state.display ? this.renderFeature() : this.renderTeaser() }
    </div>

  }

} );