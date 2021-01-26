import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export default function withContext(Context, propName) {
  return function withContextComponent(Component) {
    const WrappedComponent = props => (
      <Context.Consumer>
        {context => <Component {...props} {...{ [propName]: context }} />}
      </Context.Consumer>
    );

    WrappedComponent.displayName = `withContext-${propName}(${getDisplayName(
      Component
    )})`;

    return hoistNonReactStatics(WrappedComponent, Component);
  };
}
