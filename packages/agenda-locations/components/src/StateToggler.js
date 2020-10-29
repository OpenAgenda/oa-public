import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import Switch from 'rc-switch';

module.exports = createReactClass( {

  propTypes: {

    // current location state
    locationState: PropTypes.number,
    // label getter
    getLabel: PropTypes.func

  },

  render: function() {

    return <div className="state">
      <Switch
        checked={this.props.locationState===1}
        onChange={ b => this.props.onChange( b ? 1 : 0 )}
        checkedChildren={<i className="fa fa-check"></i>}
        unCheckedChildren={<i className="fa fa-bell-o"></i>} />
      <span>{this.props.getLabel( this.props.locationState===1 ? 'verified' : 'toverify' )}</span>
    </div>

  }

} );
