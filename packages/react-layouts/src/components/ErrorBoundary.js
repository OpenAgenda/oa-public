import React, { useState, useCallback } from 'react';
import ReactErrorBoundary from 'react-error-boundary';

export default function ErrorBoundary({
  children,
  FallbackComponent,
  ...props
}) {
  const [key, setKey] = useState(1);
  const retry = useCallback(() => setKey(state => state + 1), [setKey]);
  const FallbackWithRetryComponent = useCallback(
    fallbackProps => <FallbackComponent {...fallbackProps} retry={retry} />,
    [retry]
  );

  return (
    <ReactErrorBoundary
      key={key}
      {...props}
      FallbackComponent={FallbackWithRetryComponent}
    >
      {children}
    </ReactErrorBoundary>
  );
}
