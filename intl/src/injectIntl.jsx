import React from 'react';
import { useIntl } from 'react-intl';
import hoistNonReactStatics from 'hoist-non-react-statics';

export default function injectIntl(WrappedComponent, options = {}) {
  const { intlPropName = 'intl', forwardRef = false } = options;

  const WithIntl = ({ forwardedRef, ...props }) => {
    const intl = useIntl();
    return (
      <WrappedComponent
        {...props}
        {...{ [intlPropName]: intl }}
        ref={forwardRef ? forwardedRef : null}
      />
    );
  };

  WithIntl.displayName = `injectIntl(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  WithIntl.WrappedComponent = WrappedComponent;

  if (forwardRef) {
    return hoistNonReactStatics(
      React.forwardRef((props, ref) => (
        <WithIntl {...props} forwardedRef={ref} />
      )),
      WrappedComponent,
    );
  }

  return hoistNonReactStatics(WithIntl, WrappedComponent);
}
