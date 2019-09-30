import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { getContext } from 'recompose';
import cn from 'classnames';

class ActionsList extends Component {
  static contextTypes = {
    lang: PropTypes.string
  };

  getActionLabel = action => {
    const { lang } = this.context;

    if ( action.label[ lang ] ) {
      return action.label[ lang ];
    }

    return action.label[ Object.keys( action.label )[ 0 ] ];
  }

  triggerAction = action => {
    const { onAction, showModal } = this.props;

    if ( action.code === 'default' ) {
      return showModal( 'closeConfirmation', { action, onAction } );
    }

    if ( action.confirmationModalLabel ) {
      return showModal( 'actionConfirmation', { action, onAction } );
    }

    return onAction( action.code );
  }

  render() {
    const { actions, getLabel } = this.props;

    if ( !actions || !actions.length ) {
      return null;
    }

    return (
      <Fragment>
        {actions.map( ( action, index ) => (
          <Fragment key={action.code}>
            {index > 0 ? (
              <span>{getLabel( 'or' )}</span>
            ) : null}

            {action.code === 'default' || index > 0 ? (
              <button
                role="button"
                className="btn btn-link"
                onClick={() => this.triggerAction( action )}
              >
                {this.getActionLabel( action )}
              </button>
            ) : (
              <button
                className={cn( 'btn', {
                  [ `btn-${action.kind}` ]: !!action.kind
                } )}
                onClick={() => this.triggerAction( action )}
              >
                {this.getActionLabel( action )}
              </button>
            )}
          </Fragment>
        ) )}
      </Fragment>
    );
  }
};

export default getContext( {
  getLabel: PropTypes.func
} )( ActionsList );
