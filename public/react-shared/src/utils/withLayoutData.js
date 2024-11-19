import _ from 'lodash';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { LayoutDataContext } from '../contexts/index.js';

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export default function withLayoutData(...propNames) {
  return function withContextComponent(Component) {
    const WrappedComponent = (props) => (
      <LayoutDataContext.Consumer>
        {(context) => <Component {...props} {..._.pick(context, propNames)} />}
      </LayoutDataContext.Consumer>
    );

    WrappedComponent.displayName = `withLayoutData-${propNames.join('+')}(${getDisplayName(
      Component,
    )})`;

    return hoistNonReactStatics(WrappedComponent, Component);
  };
}
