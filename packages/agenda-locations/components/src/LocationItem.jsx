"use strict";

var React = require( 'react' ),

PropTypes = require( 'prop-types' ),

LocationMap = require( './LocationMap' ),

createReactClass = require( 'create-react-class' );

module.exports = createReactClass( {

  propTypes: {
    getLabel: PropTypes.func,
    getCountryLabel: PropTypes.func
  },

  isInMergeSelection() {

    return this.props.merge.locationUids.indexOf( this.props.location.uid ) !== -1;

  },

  onRemove( e ) {

    e.stopPropagation();

    this.props.onRemove();

  },

  renderMergeCheckbox() {

    return <div className="checkbox">
      <label>
        <input 
          ref={r => this.checkbox = r}
          type="checkbox" 
          checked={this.isInMergeSelection()} />
      </label>
    </div>

  },

  seeEvents( e ) {

    e.stopPropagation();

    window.location.href = this.props.seeEventsRes.replace( ':locationUid', this.props.location.uid );

  },

  render() {

    var l = this.props.location,

    className = [ 'item' ],

    country = this.props.getCountryLabel( l.countryCode );

    if ( this.props.merge ) className.push( 'merge' );

    return <div className={className.join( ' ' )} key={l.uid} onClick={this.props.onSelect}>
      { this.props.merge ? this.renderMergeCheckbox() : null }
      { !this.props.merge ? 
      <div className="actions btn-group">
        <button 
          className="btn btn-default" 
          aria-label={this.props.getLabel( 'remove' )}
          onClick={this.onRemove}>
          <i className="fa fa-trash"></i>
        </button>
        <button 
          className="btn btn-default" 
          aria-label={this.props.getLabel('edit')}
          onClick={this.props.onEdit}>
          <i className="fa fa-edit"></i>
        </button>
      </div> : null }
      <div className="item-body">
        <div className="title">{l.name}</div> 
        <div>{l.address}</div>
        <div className="text-muted">
          {l.department ? l.department : null}
          {l.region ? (l.department ? ', ' : '') + l.region : null}
          {country ? (l.department || l.region ? ', ' : '') + country : null}
        </div>
        <div className="indicators">
          <i className={l.image ? "fa fa-picture-o" : "fa fa-picture-o disabled"}></i>
          <i className={l.description ? "fa fa-file-text-o " : "fa fa-file-text-o disabled"}></i>
          { l.state===0 ? <span className="badge badge-warning">{this.props.getLabel( 'verify' )}</span> : null }
          { l.eventCount ?
            <a onClick={this.seeEvents}>{this.props.getLabel( l.eventCount === 1 ? 'seeEvent' : 'seeEvents', { '%count%': l.eventCount } )}</a>
          : <span className="text-muted">{this.props.getLabel( 'noEvent' )}</span> }
        </div>
      </div>
    </div>

  }

} );