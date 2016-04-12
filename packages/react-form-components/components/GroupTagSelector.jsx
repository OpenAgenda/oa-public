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

    var self = this,

    selected = this.props.value
               .map( function( v ) { return v.id; } )
               .indexOf( item.id ) !== -1;

    return <li 
      key={item.id} 
      onClick={ ( selected ? this.removeItem : this.addItem ).bind( null, item, groupIndex ) } 
      className={ selected ? 'active' : ''} >
      <span>{item.label}</span>
    </li>

  },

  renderInfo: function( group, i ) {

    // if there is an error ( and user has typed ), render that
    
    var errors = [],

    self = this;

    try {

      validator( this.props.set )( this.props.value, i );

    } catch( e ) { errors = e; };
    
    if ( this.state.userHasTyped.indexOf( i ) !== -1 && errors.length ) {

      return <p>{ errors.map( function( error ) {

        return <span
          key={error.code}
          className="error">
            {self.props.getLabel( error.code, error.values, self.props.lang )}
        </span>

      } ) }</p>

    }

    return <p>{ group.required ? <span>{this.props.getLabel( 'required', this.props.lang )}</span> : null }{ group.required && group.info ? ' - ' : null }{ group.info ? <span>{group.info}</span> : null }</p>

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

    return <div className="gt-group">
      <div className="gt-head">
        <h2>{group.name}</h2>
        {this.renderInfo( group, i )}
      </div>
      <ul className="list-unstyled gt-selector-items">{ group.tags.map( function( t ) { return self.renderItem( t, i ) } ) }</ul>
    </div>

  },

  render: function() {

    return <div className="gt-selector">
      {this.props.set.groups.map( this.renderGroup )}
    </div>

  }

} )