import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export default class ActionsList extends Component {
  constructor( props ) {
    super( props );
    this.triggerAction = ::this.triggerAction;
  }

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

  triggerAction( action ) {
    const { onAction, showModal } = this.props;

    if ( action.code === 'default' ) {
      return showModal( 'closeConfirmation', { action, onAction } );
    }

    return onAction( action.code );
  }

  render() {
    const { actions } = this.props;

    if ( !actions ) {
      return null;
    }

    return actions.map( action => (
      <div className="margin-top-sm" key={action.code}>
        <button
          className={cn( 'btn', 'btn-block', {
            [ `btn-${action.kind}` ]: !!action.kind
          } )}
          onClick={() => this.triggerAction( action )}
        >
          {this.getActionLabel( action )}
        </button>
      </div>
    ) );
  }

};
