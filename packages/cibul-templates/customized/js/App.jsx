import openRequestForm from '@openagenda/call-to-action/react/dist/openRequestForm';

const React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),

  TagEditor = require( '@openagenda/agenda-tags/build/TagEditor' ),

  CategoryEditor = require( '@openagenda/agenda-categories/build/CategoryEditor' ),

  SyncButton = require( '@openagenda/sync-button' ),

  Spinner = require( '@openagenda/sync-button/Spinner' ),

  tplEnv = window.env=='tpl',

  labels =  require( '@openagenda/labels/agenda-tags/editor' );

module.exports = createReactClass( {

  getInitialState: function() {

    return {
      tagSet: this.props.tagSet,
      categorySet: this.props.categorySet,
      synced: true,
      syncError: false,
      loading: false
    }

  },

  onSetUpdate: function( setType ) {

    var self = this;

    return function( newSet, maintainSync ) {

      var update = { synced: !!maintainSync };

      update[ setType ] = newSet

      self.setState( update );

    }

  },

  onSend: function() {

    this.setState( {
      loading: true
    } );

  },

  onResponse: function( err ) {

    this.setState( {
      loading: false,
      synced: !err,
      syncError: err
    });

  },

  renderTagSection: function() {

    return <TagEditor
      lang={this.props.lang}
      set={this.state.tagSet}
      onSetUpdate={this.onSetUpdate( 'tagSet' )}/>

  },

  render: function() {

    return <div>
      <div className="tc-edge">
        <button
          className="btn btn-default pull-right"
          onClick={() => openRequestForm( {
            subject: 'customFields',
            lang: this.props.lang
          } )}
        >
          {labels.customFieldsFeature[this.props.lang]}
        </button>
        <SyncButton
          lang={this.props.lang}
          res={this.props.uploadRes}
          onSend={this.onSend}
          onResponse={this.onResponse}
          synced={this.state.synced}
          syncError={this.state.syncError}
          data={ {
            tagSet: this.state.tagSet,
            categorySet: this.state.categorySet
          } } />
      </div>
      <CategoryEditor
        extraFeatures={this.props.extraFeatures}
        lang={this.props.lang}
        set={this.state.categorySet}
        onSetUpdate={this.onSetUpdate( 'categorySet' )} />
      { this.props.extraFeatures?this.renderTagSection() : '' }
      <div className="tc-edge">
        <SyncButton
          lang={this.props.lang}
          res={this.props.uploadRes}
          onSend={this.onSend}
          onResponse={this.onResponse}
          synced={this.state.synced}
          syncError={this.state.syncError}
          data={ {
            tagSet: this.state.tagSet,
            categorySet: this.state.categorySet
          } } />
      </div>
      <Spinner loading={this.state.loading} />
    </div>;

  }

} );
