"use strict";

var React = require( 'react' ),

  monitorBottomHit = require( 'dom-utils/monitorBottomHit' );

module.exports = React.createClass( {

  propTypes: {
    items: React.PropTypes.array,
    total: React.PropTypes.number,
    pageRange: React.PropTypes.array,
    limit: React.PropTypes.number,
    getPage: React.PropTypes.func,
    renderItem: React.PropTypes.func,
    prevLabel: React.PropTypes.string,
    nextLabel: React.PropTypes.string,
    renderEmpty: React.PropTypes.oneOfType( [
      React.PropTypes.func,
      React.PropTypes.string
    ] ),
    renderPrev: React.PropTypes.oneOfType( [
      React.PropTypes.func,
      React.PropTypes.string
    ] ),
    renderNext: React.PropTypes.oneOfType( [
      React.PropTypes.func,
      React.PropTypes.string
    ] )
  },

  getDefaultProps() {

    return {
      items: [],
      pageRange: [ 1, 1 ],
      limit: 20,
      prevLabel: 'load previous',
      nextLabel: 'load next',
      renderEmpty: () => null
    }

  },

  isClient() {

    return typeof document !== 'undefined';

  },

  getInitialState() {

    return {}

  },

  hasNextPage() {

    var lastPage = this.props.pageRange[ 1 ];

    return lastPage * this.props.limit < this.props.total;

  },

  hasPrevPage() {

    return this.props.pageRange[ 0 ] > 1;

  },

  componentWillMount() {

    if ( this.isClient() ) monitorBottomHit( () => {

      this.props.getPage( true );

    } );

  },

  renderPrev() {

    if ( this.props.renderPrev )
      return typeof this.props.renderPrev === 'function' ? this.props.renderPrev() : this.props.renderPrev;
    else if ( this.hasPrevPage() )
      return (
        <nav className="page-nav">
          <button className="btn btn-default"
                  onClick={this.props.getPage.bind( null, false )}>{this.props.prevLabel}</button>
        </nav>
      );
    
  },

  renderNext() {

    if ( this.props.renderNext )
      return typeof this.props.renderNext === 'function' ? this.props.renderNext() : this.props.renderNext;
    else if ( this.hasNextPage() )
      return (
        <nav className="page-nav">
          <button className="btn btn-default"
                  onClick={this.props.getPage.bind( null, true )}>{this.props.nextLabel}</button>
        </nav>
      );
    
  },

  render() {

    return (
      <div>
        {this.renderPrev()}
        <div>
          {this.props.items.length ? this.props.items.map( this.props.renderItem ) : this.props.renderEmpty}
        </div>
        {this.renderNext()}
      </div>
    )

  }

} );