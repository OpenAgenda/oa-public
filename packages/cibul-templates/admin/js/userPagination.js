"use strict";

var React = require( 'react' ),

  createReactClass = require( 'create-react-class' );

module.exports = createReactClass({

  handleClick: function( e ) {

    e.preventDefault();

    this.props.onPageSelect( e.target.innerHTML );

  },

  render: function() {

    var pages = [], self = this,

    pageCount = Math.ceil( this.props.total/this.props.perPage ),

    createItem = function( item ) {

      return <li key={item} onClick={self.handleClick}><a>{item}</a></li>;

    },

    firstPage = Math.max( 1, this.props.page - 5 ),

    maxPage = Math.min( this.props.page + 5, pageCount );

    for( var i = firstPage; i<=maxPage; i++ ) {

      pages.push( i );

    }

    return <nav><ul className="pagination">{pages.map( createItem )}</ul></nav>;

  }

});
