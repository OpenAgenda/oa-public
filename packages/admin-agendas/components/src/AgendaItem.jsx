"use strict";

var React = require( 'react' );

module.exports = React.createClass( {

  displayName: 'AgendaItem',

  propTypes: {
    agenda: React.PropTypes.object,
    onSelect: React.PropTypes.func
  },

  render: function() {

    return <div className="agenda-item media cursor-pointer" onClick={this.props.onSelect.bind(null, this.props.agenda.id)}>
      <a>
        <div className="media-body">
          <h4 className="title media-heading">{this.props.agenda.title}</h4>
        </div>
      </a>
    </div>

  }

} );