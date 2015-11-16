"use strict";

var React = require( 'react' ),

TagEditor = require( 'tag-editor/lib/TagEditor.jsx' ),

CategoryEditor = require( 'category-editor/lib/CategoryEditor.jsx' ),

SyncButton = require( 'sync-button' ),

Spinner = require( 'sync-button/Spinner.jsx' );

module.exports = React.createClass( {

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

  render: function() {

    return <div>
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
            categorySet: this.state.categorySet } } />
      </div>
      <CategoryEditor
        lang={this.props.lang}
        set={this.state.categorySet}
        onSetUpdate={this.onSetUpdate( 'categorySet' )} />
      <TagEditor
        lang={this.props.lang}
        set={this.state.tagSet}
        onSetUpdate={this.onSetUpdate( 'tagSet' )} />
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
            categorySet: this.state.categorySet } } />
      </div>
      <Spinner
        loading={this.state.loading} />
    </div>;

  }

} );