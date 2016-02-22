"use strict";

var React = require( 'react' ),

monitorBottomHit = require( 'dom-utils/monitorBottomHit' );

module.exports = React.createClass( {

  propTypes: {
    items: React.PropTypes.array,
    total: React.PropTypes.number,
    pageRange: React.PropTypes.array,
    limit: React.PropTypes.number
  },

  getDefaultProps() {

    return {
      items: [],
      pageRange: [ 1, 1 ],
      limit: 20
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

  render() {

    return <div>
      { this.hasPrevPage()?
      <nav className="page-nav">
        <button className="btn btn-default" onClick={this.props.getPage.bind( null, false )}>load previous</button>
      </nav> : null }
      <div>
        {this.props.items.map( this.props.renderItem )}
      </div>
      { this.hasNextPage() ?
      <nav className="page-nav">
        <button className="btn btn-default" onClick={this.props.getPage.bind( null, true )}>load next</button>
      </nav> : null }
    </div>

  }

} );