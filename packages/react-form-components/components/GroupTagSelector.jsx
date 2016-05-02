"use strict";

var React = require( 'react' ),

makeLabelGetter = require( '../lib/makeLabelGetter' ),

validator = require( '../validators/groupTags' ),

labels = require( '../labels' );

module.exports = React.createClass( {

  displayName: 'GroupTagSelector',

  propTypes: {

    lang: React.PropTypes.string,

    // name of component set, given back on callback value
    name: React.PropTypes.string.isRequired,

    // set of tag groups
    set: React.PropTypes.object,

    // used by component to load labels
    getLabel: React.PropTypes.func,

    // current tag selection
    value: React.PropTypes.array

  },

  getDefaultProps: function() {

    return {
      lang: 'en',
      getLabel: makeLabelGetter( labels )
    }

  },

  getInitialState: function() {

    return {
      userHasTyped: []
    }

  },

  addItem: function( item, groupIndex ) {

    this.setState( {
      userHasTyped: this.state.userHasTyped.concat( [ groupIndex ] )
    } );

    this.props.onChange( this.props.name, this.props.value.concat( item ) );

  },

  getErrors: function( ) { 

    return [];

  },

  removeItem: function( item, groupIndex ) {

    var newSelection = this.props.value.filter( function( vItem ) {

      return item.id !== vItem.id;

    } );

    this.setState( {
      userHasTyped: this.state.userHasTyped.concat( [ groupIndex ] )
    } );

    this.props.onChange( this.props.name, newSelection );

  },

  renderItem: function( item, groupIndex ) {

    var checked = this.props.value
               .map( function( v ) { return v.id; } )
               .indexOf( item.id ) !== -1;

    return <div className="checkbox" 
      key={item.id}>
      <label>
        <input type="checkbox" checked={checked} onChange={ ( checked ? this.removeItem : this.addItem ).bind( null, item, groupIndex ) } />
        {item.label}
      </label>
    </div>

  },

  renderGroup: function( group, i ) {

    var self = this,

    errors = [];

    try {

      // cleans and throws errors
      validator( this.props.set, this.props.value, i );

    } catch( errs ) {

      errors = errs;

    }

    return <div className="gt-group" key={i}>
      <div className="gt-head">
        <label className={ errors.length ? 'error' : '' }>{group.name}{ group.required ? ' (*)' : '' }</label>
        { group.info ? <p>{group.info}</p> : null }
      </div>
      <div className="list-unstyled gt-selector-items">{ group.tags.map( function( t ) { return self.renderItem( t, i ) } ) }</div>
    </div>

  },

  render: function() {

    return <div className="gt-selector">
      {this.props.set.groups.map( this.renderGroup )}
    </div>

  }

} )