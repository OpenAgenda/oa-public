import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export default class ActionsList extends Component {

  static contextTypes = {
    lang: PropTypes.string
  };

  getActionLabel( action ) {
    const { lang } = this.context;

    if ( action.label[ lang ] ) {
      return action.label[ lang ];
    }

    return action.label[ Object.keys( action.label )[ 0 ] ];
  }

  render() {
    const { actions, onAction } = this.props;

    if ( !actions ) {
      return null;
    }

    return actions.map( action => (
      <div className="margin-top-sm" key={action.code}>
        <button
          className={cn( 'btn', 'btn-block', {
            [ `btn-${action.kind}` ]: !!action.kind
          } )}
          onClick={() => onAction( action.code )}
        >
          {this.getActionLabel( action )}
        </button>
      </div>
    ) );
  }

};
