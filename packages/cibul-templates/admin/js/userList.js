var React = require( 'react' ),

  createReactClass = require( 'create-react-class' );

module.exports = createReactClass({

  onClick: function( item, e ) {

    e.preventDefault();

    this.props.onUserClick( item.uid );

  },

  render: function() {

    var self = this,

    createItem = function( item ) {

      return <li className="list-group-item" key={item.uid} onClick={self.onClick.bind(null, item)}>
        <a href="#">
          <span>
            {item.fullName}</span> - <span>{item.email}
            {item.isRemoved ? <span style={{ color: 'brown' }}>Account removed</span> : null}
          </span>
        </a>
      </li>

    };

    return <ul className="list-group">{this.props.users.map( createItem )}</ul>;

  }

});
