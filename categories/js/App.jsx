"use strict";

var React = require( 'react' ),

TagEditor = require( 'tag-editor/lib/TagEditor.jsx' ),

CategoryEditor = require( 'category-editor/lib/CategoryEditor.jsx' ),

SyncButton = require( 'sync-button' ),

Spinner = require( 'sync-button/Spinner.jsx' ),

FeatureRequest = require( './FeatureRequest.jsx' ),

labels = {
  tagFeatureTitle: {
    fr: 'Essayez les tags d\'agenda',
    en: 'Try agenda tags'
  },
  tagFeatureDescription: {
    fr: 'Organisez vos événements via un ou plusieurs groupes de tags; nommez vos groupes, organisez et ordonnez-les pour offrir à vos utilisateurs des filtres plus adaptés à vos événements!',
    en: 'Organize your events with one or more tag groups; organize and sort your tags to give the best possible selection of filters for your events!'
  },
  tagFeatureTeaser: {
    fr: 'Faites plus avec des groupes de tags',
    en: 'Do more with tag groups'
  }
},

tplEnv = window.env=='tpl';

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

  renderFeatureRequest: function() {

    return <FeatureRequest
      lang={this.props.lang}
      labels={{
        title: labels.tagFeatureTitle,
        teaser: labels.tagFeatureTeaser,
        description: labels.tagFeatureDescription
      }}
      res={ tplEnv ? "#featurerequest" : "/featurerequest" } />

  },

  renderTagSection: function() {

    return <TagEditor
      lang={this.props.lang}
      set={this.state.tagSet}
      onSetUpdate={this.onSetUpdate( 'tagSet' )} />

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
            categorySet: this.state.categorySet
          } } />
      </div>
      <CategoryEditor
        lang={this.props.lang}
        set={this.state.categorySet}
        onSetUpdate={this.onSetUpdate( 'categorySet' )} />
      {this.props.useTags?this.renderTagSection():''}
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
        {this.props.useTags?'':this.renderFeatureRequest()}
      </div>
      <Spinner
        loading={this.state.loading} />
    </div>;

  }

} );