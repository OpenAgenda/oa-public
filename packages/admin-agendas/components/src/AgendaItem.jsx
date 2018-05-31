"use strict";

const React = require( 'react' );
const PropTypes = require( 'prop-types' );
const createReactClass = require( 'create-react-class' );

module.exports = createReactClass( {

  displayName: 'AgendaItem',

  propTypes: {
    agenda: PropTypes.object,
    onSelect: PropTypes.func
  },

  render: function() {

    return <div className="agenda-item media cursor-pointer" onClick={this.props.onSelect.bind(null, this.props.agenda.id, 1)}>
      <a>
        <div className="media-body">
          <h4 className="title media-heading">{this.props.agenda.title}</h4>
        </div>
      </a>
    </div>

  }

} );